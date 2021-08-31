import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable, of, TimeoutError } from "rxjs";
import { catchError, map, timeout } from "rxjs/operators";

import { environment } from "../../environments/environment";

@Injectable({
    providedIn: "root",
})
export class WatersService {
    REQUEST_TIMEOUT = 20000; // 1000 = 1 second

    constructor(private http: HttpClient) {}

    params = {
        where: "",
        text: "",
        time: "",
        geometry: "",
        geometryType: "esriGeometryPoint",
        inSR: "",
        spatialRel: "esriSpatialRelIntersects",
        returnGeometry: "true",
        returnTrueCurves: "true",
        geometryPrecision: "",
        outSR: "B wkid+A+4326 D",
        returnIdsOnly: "false",
        returnCountOnly: "false",
        orderByFields: "",
        groupByFieldsForStatistics: "",
        outStatistics: "",
        returnZ: "false",
        gdbVersion: "",
        returnDistinctValues: "false",
        resultOffset: "",
        resultRecordCount: "",
        queryByDistance: "",
        returnExtentsOnly: "false",
        datumTransformation: "",
        parameterValues: "",
        rangeValues: "",
        f: "geojson",
    };

    // these are the values that the huc request will return in addition to the geometry
    // https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/0
    hucOutputFields = [
        "OBJECTID",
        "Shape",
        "GAZ_ID",
        "AREA_ACRES",
        "AREA_SQKM",
        "STATES",
        "LOADDATE",
        "HUC_2",
        "HU_2_NAME",
        "HUC_4",
        "HU_4_NAME",
        "HUC_6",
        "HU_6_NAME",
        "HUC_8",
        "HU_8_NAME ",
        "HUC_10",
        "HU_10_NAME",
        "HUC_12",
        "HU_12_NAME",
        "HU_12_TYPE",
        "HU_12_MOD",
        "NCONTRB_ACRES",
        "NCONTRB_SQKM ",
        "HU_10_TYPE",
        "HU_10_MOD",
        "Shape_Length",
        "Shape_Area",
    ];

    // these are the values that the catchment request will return in addition to the geometry
    // https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/Catchments_NP21_Simplified/MapServer/0
    catchmentOutputFields = [
        "OBJECTID",
        "Shape",
        "Shape_Length",
        "Shape_Area",
        "FEATUREID",
        "SOURCEFC",
        "GRIDCODE",
        "AREASQKM",
        "WBD_HUC12",
        "WBD_HUC12_PERCENT ",
        "NHDPLUS_REGION",
        "NHDPLUS_VERSION",
    ];

    getHucData(hucType, lat, lng): Observable<any> {
        let url = environment.NHDPlusUrl;

        if (hucType === "HUC_12") {
            url += "WBD_NP21_Simplified/MapServer/0/query?";
        }

        const params = { ...this.params };
        params.geometry = `{"x":${lng},"y":${lat},"spatialReference":{"wkid":4326}}`;

        return this.http.get(`${url}${this.serialize(params)}&outFields=${this.hucOutputFields.join(",+")}`).pipe(
            timeout(this.REQUEST_TIMEOUT),
            catchError((error) => {
                if (error instanceof TimeoutError) {
                    return of({ error: "Request to getHucData timed out", message: error.message });
                } else {
                    return of({ message: error.message, error });
                }
            })
        );
    }

    getCatchmentData(lat, lng): Observable<any> {
        let url = environment.NHDPlusUrl;
        url += "Catchments_NP21_Simplified/MapServer/0/query?";

        const params = { ...this.params };
        params.geometry = `{"x":${lng},"y":${lat},"spatialReference":{"wkid":4326}}`;

        return this.http.get(`${url}${this.serialize(params)}&outFields=${this.catchmentOutputFields.join(",+")}`).pipe(
            timeout(this.REQUEST_TIMEOUT),
            catchError((error) => {
                if (error instanceof TimeoutError) {
                    return of({ error: "Request to getCatchmentData timed out", message: error.message });
                } else {
                    return of({ message: error.message, error });
                }
            })
        );
    }

    // this returns the stream geometry and "event" locations
    // starting at 'comid' and ending at 'distance' upstream
    getNetworkGeometry(comid: string, distance: string): Observable<any> {
        let options = {
            pNavigationType: "UT", // Upstream with tributaries
            pStartComid: comid,
            pTraversalSummary: "TRUE",
            pFlowlinelist: "TRUE",
            pEventList: "10012,10030", // 10012 - STORET, Water Monitoring | 10030 - NPGAGE, USGS Streamgages from NHDPlus
            pEventListMod: ",",
            pStopDistancekm: distance, // if value is null, set to default value: 50km
            pNearestEntityList: "STORET,NPGAGE",
            pNearestEntityListMod: ",",
            optOutPruneNumber: 8,
            optOutCS: "SRSNAME=urn:ogc:def:crs:OGC::CRS84",
        };

        return this.http.get(`${environment.watersUrl}UpstreamDownstream.Service?${this.serialize(options)}`).pipe(
            map((data) => {
                data = {
                    networkGeometry: { ...data },
                };
                return data;
            }),
            timeout(this.REQUEST_TIMEOUT),
            catchError((error) => {
                if (error instanceof TimeoutError) {
                    return of({ error: "Request to getNetworkGeometry timed out", message: error.message });
                } else {
                    return of({ message: error.message, error });
                }
            })
        );
    }

    /* from https://github.com/Esri/esri-leaflet/blob/master/src/Request.js */
    // js object to GET request parameter string
    serialize(params): string {
        let data = "";

        params.f = params.f || "json";

        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                const param = params[key];
                const type = Object.prototype.toString.call(param);
                let value;

                if (data.length) {
                    data += "&";
                }

                if (type === "[object Array]") {
                    value =
                        Object.prototype.toString.call(param[0]) === "[object Object]"
                            ? JSON.stringify(param)
                            : param.join(",");
                } else if (type === "[object Object]") {
                    value = JSON.stringify(param);
                } else if (type === "[object Date]") {
                    value = param.valueOf();
                } else {
                    value = param;
                }

                data += encodeURIComponent(key) + "=" + encodeURIComponent(value);
            }
        }
        return data;
    }
}
