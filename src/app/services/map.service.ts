import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable, Subject, of, throwError } from "rxjs";
import { catchError, map, tap, timeout } from "rxjs/operators";

import * as L from "leaflet";

import { LayerService } from "src/app/services/layer.service";
import { SimulationService } from "./simulation.service";

@Injectable({
  providedIn: "root",
})
export class MapService {
  watersUrl = "https://ofmpub.epa.gov/waters10/";

  map: L.Map;

  // State letiables interface steps
  hucSelected = null;
  pourSelected = null;

  // flag = L.icon({
  //   iconUrl: "../assets/images/icon_flag.png",
  //   iconSize: [32, 32], // size of the icon
  //   iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
  // });

  constructor(
    private layerService: LayerService,
    private simulation: SimulationService,
    private http: HttpClient
  ) {}

  initMap(): void {
    if (!this.map) {
      this.map = L.map("map", {
        center: [38.5, -96], // US geographical center
        zoom: 10,
        minZoom: 5,
      });
      this.map.on("click", (mapClickEvent) => {
        this.handleClick(mapClickEvent);
      });
      this.map.on("mousemove", (mapMoveEvent) => {
        // this.handleMove(mapMoveEvent);
      });
      this.map.on("drag", (mapDragEvent) => {
        this.handleDrag(mapDragEvent);
      });
      this.map.on("zoomend", (mapZoomEvent) => {
        this.handleZoom(mapZoomEvent);
      });
    }
    this.layerService.setupLayers(this.map);
  }

  handleClick(mapClickEvent): void {
    if (!this.hucSelected) {
      this.getHuc(mapClickEvent.latlng);
    }
    if (this.hucSelected && !this.pourSelected) {
      this.getPourPoint(mapClickEvent.latlng);
    }
  }

  handleDrag(mapDragEvent): void {
    // console.log('mapDragEvent: ', mapDragEvent);
  }

  handleZoom(mapZoomEvent) {
    let zoom = this.map.getZoom();
  }

  handleMove(mapMoveEvent) {
    // this.getHucData(
    //   "HUC_12",
    //   mapMoveEvent.latlng.lat,
    //   mapMoveEvent.latlng.lng
    // ).subscribe((data) => {
    //   if (this.hoverLayer !== null) {
    //     this.map.removeLayer(this.hoverLayer);
    //   }
    //   this.hoverLayer = L.geoJSON(data, {
    //     style: {
    //       color: "#FF0000",
    //       weight: 2,
    //       fillColor: "#FF0000",
    //       fillOpacity: 0.25,
    //     },
    //   })
    //     .setZIndex(4)
    //     .addTo(this.map);
    // });
  }

  getHuc(coords): void {
    this.getHucData("HUC_12", coords.lat, coords.lng).subscribe((data) => {
      if (data) {
        this.simulation.updateSimData("coords", coords);
        this.simulation.updateSimData("huc", data);
        this.hucSelected = {
          HUC_12: data.features[0].properties.HUC_12,
          HUC_12_NAME: data.features[0].properties.HU_12_NAME,
        };
        this.layerService.addFeature(data);
      }
    });
  }

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
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        if (err.name == "TimeoutError") {
          return of(err);
        }
        return of({ error: err });
      })
    );
  }

  getPourPoint(latlng): void {
    this.getPourPointData(latlng.lat, latlng.lng).subscribe((data) => {
      if (data) {
        this.simulation.updateSimData("pour", data);
        this.pourSelected = {
          pour: data,
        };
        this.layerService.addFeature(data);
      }
    });
  }

  getPourPointData(lat, lng): Observable<any> {
    let data = {
      pGeometry: "POINT(" + lng + " " + lat + ")",
      pGeometryMod: "WKT,SRSNAME=urn:ogc:def:crs:OGC::CRS84",
      pPointIndexingMethod: "DISTANCE",
      pPointIndexingRaindropDist: 0,
      pPointIndexingMaxDist: 25,
      pOutputPathFlag: "TRUE",
      pReturnFlowlineGeomFlag: "FALSE",
    };

    const request =
      this.watersUrl + "PointIndexing.Service?" + this.serialize(data);

    return this.http.get(request).pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        if (err.name == "TimeoutError") {
          return of(err);
        }
        return of({ error: err });
      })
    );
  }

  getCatchment(): void {}

  getCatchmentData(lat, lng): Observable<any> {
    // COMID Request
    let url =
      "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/Catchments_NP21_Simplified/MapServer/0/query?where=&text=&objectIds=&time=&geometry=%7B%22x%22+%3A+" +
      lng +
      "%2C+%22y%22+%3A+" +
      lat +
      "%2C+%22spatialReference%22+%3A+%7B%22wkid%22+%3A+4326%7D%7D&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelWithin&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=%7B%22wkt%22+%3A+%22GEOGCS%5B%5C%22GCS_WGS_1984%5C%22%2CDATUM%5B%5C%22D_WGS_1984%5C%22%2C+SPHEROID%5B%5C%22WGS_1984%5C%22%2C6378137%2C298.257223563%5D%5D%2CPRIMEM%5B%5C%22Greenwich%5C%22%2C0%5D%2C+UNIT%5B%5C%22Degree%5C%22%2C0.017453292519943295%5D%5D%22%7D&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=geojson";
    return this.http.get(url).pipe(
      map((data: any) => {
        return data;
      }),
      timeout(5000),
      catchError((err) => {
        if (err.name == "TimeoutError") {
          return of(err);
        }
        return of({ error: err });
      })
    );
  }

  getStreamNetwork(err, response): void {
    if (err) {
      console.log("ERROR: " + err);
    }

    let srv_rez = response.output;
    let comid = srv_rez.ary_flowlines[0].comid;
    let measure = srv_rez.ary_flowlines[0].fmeasure;

    // adds new snapline to layer
    // let tmp_feature = this.geojson2feature(srv_rez.indexing_path);
    // this.snapline.addData(tmp_feature).setStyle({
    //   color: "#FF0000",
    //   fillColor: "#FF0000"
    // });

    let data = {
      pNavigationType: "UT", // Upstream with tributaries
      pStartComid: comid,
      pStartMeasure: measure,
      pTraversalSummary: "TRUE",
      pFlowlinelist: "TRUE",
      pEventList: "10012,10030", // 10012 - STORET, Water Monitoring | 10030 - NPGAGE, USGS Streamgages from NHDPlus
      pEventListMod: ",",
      pStopDistancekm: 50, // if value is null, set to default value: 50km
      pNearestEntityList: "STORET,NPGAGE",
      pNearestEntityListMod: ",",
      //"optQueueResults": "THREADED", // using this option puts the request in a queue, must check for "complete"
      optOutPruneNumber: 8,
      optOutCS: "SRSNAME=urn:ogc:def:crs:OGC::CRS84",
    };

    this.http
      .get(
        this.watersUrl + "UpstreamDownstream.Service?" + this.serialize(data)
      )
      .subscribe((data) => {
        this.layerService.buildStreamLayer(data);
      });
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
