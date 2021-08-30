import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({
    providedIn: "root",
})
export class WatersService {
    watersUrl = "https://ofmpub.epa.gov/waters10/";
    NHDPlusUrl = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/";

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
        let url = this.NHDPlusUrl;

        if (hucType === "HUC_12") {
            url += "WBD_NP21_Simplified/MapServer/0/query?";
        }

        const params = { ...this.params };
        params.geometry = `{"x":${lng},"y":${lat},"spatialReference":{"wkid":4326}}`;

        return this.http.get(`${url}${this.serialize(params)}&outFields=${this.hucOutputFields.join(",+")}`).pipe(
            catchError((err) => {
                return of({ error: err });
            })
        );
    }

    getCatchmentData(lat, lng): Observable<any> {
        let url = this.NHDPlusUrl;
        url += "Catchments_NP21_Simplified/MapServer/0/query?";

        const params = { ...this.params };
        params.geometry = `{"x":${lng},"y":${lat},"spatialReference":{"wkid":4326}}`;

        return this.http.get(`${url}${this.serialize(params)}&outFields=${this.catchmentOutputFields.join(",+")}`).pipe(
            catchError((err) => {
                return of({ error: err });
            })
        );
    }

    // this returns the stream geometry and "event" locations
    // starting at 'comid' and ending at 'distance' upstream
    getStreamNetworkData(comid, distance): Observable<any> {
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

        return this.http.get(`${this.watersUrl}UpstreamDownstream.Service?${this.serialize(options)}`).pipe(
            catchError((err) => {
                return of({ error: err });
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
