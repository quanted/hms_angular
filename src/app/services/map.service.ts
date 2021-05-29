import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable, of } from "rxjs";
import { catchError, map, timeout } from "rxjs/operators";

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
  hucSelected = false;
  catchmentSelected = false;

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
    } else {
      if (this.hucSelected && !this.catchmentSelected) {
        this.getCatchment(mapClickEvent.latlng);
      }
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

  removeFeature(type, id): void {
    this.layerService.removeFeature(id);
    if (type == "huc") this.hucSelected = false;
    if (type == "catchment") this.catchmentSelected = false;
  }

  getHuc(coords): void {
    this.hucSelected = true;
    this.getHucData("HUC_12", coords.lat, coords.lng).subscribe((data) => {
      if (data) {
        this.simulation.updateSimData("coords", coords);
        const properties = data.features[0].properties;
        this.simulation.updateSimData("huc", {
          areaAcres: properties.AREA_ACRES,
          areaSqKm: properties.AREA_SQKM,
          id: properties.HUC_12,
          name: properties.HU_12_NAME,
        });
        this.layerService.addFeature(data.features[0].properties.HUC_12, data);
      } else {
        this.hucSelected = false;
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

  getCatchment(coords): void {
    this.getCatchmentData(coords.lat, coords.lng).subscribe((data) => {
      if (data) {
        this.catchmentSelected = true;
        const properties = data.features[0].properties;
        this.simulation.updateSimData("catchment", {
          areaSqKm: properties.AREA_SQKM,
          id: properties.FEATUREID,
        });
        this.layerService.addFeature(
          data.features[0].properties.FEATUREID,
          data
        );
      } else {
        this.catchmentSelected = false;
      }
    });
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

  getStreamNetwork(comid): void {
    let data = {
      pNavigationType: "UT", // Upstream with tributaries
      pStartComid: comid,
      pTraversalSummary: "TRUE",
      pFlowlinelist: "TRUE",
      pEventList: "10012,10030", // 10012 - STORET, Water Monitoring | 10030 - NPGAGE, USGS Streamgages from NHDPlus
      pEventListMod: ",",
      pStopDistancekm: 50, // if value is null, set to default value: 50km
      pNearestEntityList: "STORET,NPGAGE",
      pNearestEntityListMod: ",",
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
