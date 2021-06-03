import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class WatersService {
  watersUrl = "https://ofmpub.epa.gov/waters10/";

  constructor(private http: HttpClient) {}

  getHucData(hucType, lat, lng): Observable<any> {
    let baseUrl = "";
    let point =
      '&geometry={"x":' +
      lng +
      ',"y":' +
      lat +
      ',"spatialReference":{"wkid":4326}}';
    let outFields = "";
    let params =
      "&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&returnGeometry=true&returnTrueCurves=false&geometryPrecision=&outSR=%7B%22wkid%22+%3A+4326%7D&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=geojson";

    if (hucType === "HUC_12") {
      baseUrl =
        "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/0/query?where=&text=&time=";
      outFields =
        "&outFields=OBJECTID%2C+Shape%2C+GAZ_ID%2C+AREA_ACRES%2C+AREA_SQKM%2C+STATES%2C+LOADDATE%2C+HUC_2%2C+HU_2_NAME%2C+HUC_4%2C+HU_4_NAME%2C+HUC_6%2C+HU_6_NAME%2C+HUC_8%2C+HU_8_NAME%2C+HUC_10%2C+HU_10_NAME%2C+HUC_12%2C+HU_12_NAME%2C+HU_12_TYPE%2C+HU_12_MOD%2C+NCONTRB_ACRES%2C+NCONTRB_SQKM%2C+HU_10_TYPE%2C+HU_10_MOD%2C+Shape_Length%2C+Shape_Area";
    }
    // else if (hucType === "HUC_10"){
    //     baseUrl = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/1/query?where=&text=&time=";
    //     outFields = "&outFields=OBJECTID%2C+Shape%2C+GAZ_ID%2C+AREA_ACRES%2C+AREA_SQKM%2C+STATES%2C+LOADDATE%2C+HUC_2%2C+HU_2_NAME%2C+HUC_4%2C+HU_4_NAME%2C+HUC_6%2C+HU_6_NAME%2C+HUC_8%2C+HU_8_NAME%2C+HUC_10%2C+HU_10_NAME%2C+NCONTRB_ACRES%2C+NCONTRB_SQKM%2C+HU_10_TYPE%2C+HU_10_MOD%2C+Shape_Length%2C+Shape_Area";
    // }
    else {
      hucType = "HUC_8";
      baseUrl =
        "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/2/query?where=&text=&time=";
      outFields =
        "&outFields=OBJECTID%2C+Shape%2C+GAZ_ID%2C+AREA_ACRES%2C+AREA_SQKM%2C+STATES%2C+LOADDATE%2C+HUC_2%2C+HU_2_NAME%2C+HUC_4%2C+HU_4_NAME%2C+HUC_6%2C+HU_6_NAME%2C+HUC_8%2C+HU_8_NAME%2C+Shape_Length%2C+Shape_Area";
    }
    let queryString = point + outFields + params;
    return this.http.get(baseUrl + queryString).pipe(
      catchError((err) => {
        return of({ error: err });
      })
    );
  }

  getCatchmentData(lat, lng): Observable<any> {
    // COMID Request
    let url =
      "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/Catchments_NP21_Simplified/MapServer/0/query?where=&text=&objectIds=&time=&geometry=%7B%22x%22+%3A+" +
      lng +
      "%2C+%22y%22+%3A+" +
      lat +
      "%2C+%22spatialReference%22+%3A+%7B%22wkid%22+%3A+4326%7D%7D&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelWithin&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=%7B%22wkt%22+%3A+%22GEOGCS%5B%5C%22GCS_WGS_1984%5C%22%2CDATUM%5B%5C%22D_WGS_1984%5C%22%2C+SPHEROID%5B%5C%22WGS_1984%5C%22%2C6378137%2C298.257223563%5D%5D%2CPRIMEM%5B%5C%22Greenwich%5C%22%2C0%5D%2C+UNIT%5B%5C%22Degree%5C%22%2C0.017453292519943295%5D%5D%22%7D&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=geojson";
    return this.http.get(url).pipe(
      catchError((err) => {
        return of({ error: err });
      })
    );
  }

  getStreamNetworkData(comid, distance): Observable<any> {
    let data = {
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

    return this.http
      .get(
        this.watersUrl + "UpstreamDownstream.Service?" + this.serialize(data)
      )
      .pipe(
        map((data: any) => {
          return data;
        }),
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
