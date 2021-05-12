import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable, of, throwError } from "rxjs";
import { catchError, map, tap, timeout } from "rxjs/operators";

import * as L from "leaflet";

import { LayerService } from "src/app/services/layer.service";

@Injectable({
  providedIn: "root",
})
export class MapService {
  basemapLayers = [
    /* "Map Name": L.tileLayer, */
  ];
  featureLayers = [
    /* "Marker": ESRI.featureLayer, */
  ];

  defaultBasemap = "Open Street Map";

  map: L.Map;
  hoverLayer: L.GeoJSON = null;
  hucLayer: L.GeoJSON = null;
  catchmentLayer: L.GeoJSON = null;
  snapline: L.GeoJSON = null;
  streamLayer: L.GeoJSON = null;
  searchStartStream: L.GeoJSON = null;
  stationLayer: L.GeoJSON = null;

  // flag = L.icon({
  //   iconUrl: "../assets/images/icon_flag.png",
  //   iconSize: [32, 32], // size of the icon
  //   iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
  // });

  constructor(private layerService: LayerService, private http: HttpClient) {}

  initMap(): void {
    // setup map
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
        this.handleMove(mapMoveEvent);
      });
      this.map.on("drag", (mapDragEvent) => {
        this.handleDrag(mapDragEvent);
      });
      this.map.on("zoomend", (mapZoomEvent) => {
        this.handleZoom(mapZoomEvent);
      });
    }
    this.setupLayers();
  }

  setupLayers() {
    this.basemapLayers = this.layerService.getBasemapLayers();
    this.addDefaultBasemap();
    this.featureLayers = this.layerService.getFeatureLayers();
  }

  addDefaultBasemap(): void {
    for (let map of this.basemapLayers) {
      if (map.name == this.defaultBasemap) {
        this.map.addLayer(map.layer);
        map.show = true;
      }
    }
  }

  getLayers() {
    return {
      basemaps: this.basemapLayers,
      features: this.featureLayers,
    };
  }

  toggleLayer(type, name): void {
    switch (type) {
      case "basemap":
        for (let map of this.basemapLayers) {
          if (map.show) {
            map.show = false;
            this.map.removeLayer(map.layer);
          }
          if (map.name == name) {
            map.show = true;
            this.map.addLayer(map.layer);
          }
        }
        break;
      case "feature":
        for (let feature of this.featureLayers) {
          if (feature.name == name) {
            feature.show = !feature.show;
          }
          if (feature.show) {
            this.map.addLayer(feature.layer);
          } else {
            this.map.removeLayer(feature.layer);
          }
        }
        break;
      default:
        console.log("UNKNOWN MAP_LAYER_TYPE: ", type);
    }
  }

  updateStyle(command) {
    this.layerService.updateFeatureStyle(command.name, command.style);
  }

  controlCommand(command): void {
    switch (command.command) {
      case "toggle":
        this.toggleLayer(command.layerType, command.name);
        break;
      case "update-style":
        this.updateStyle(command);
        break;
      case "refresh":
        break;
      default:
        console.log("UNKNOWN CONTROL_COMMAND: ", command);
    }
  }

  handleClick(mapClickEvent): void {
    this.getHucData(
      "HUC_12",
      mapClickEvent.latlng.lat,
      mapClickEvent.latlng.lng
    ).subscribe((data) => {
      if (this.hucLayer !== null) {
        this.map.removeLayer(this.hucLayer);
      }
      this.hucLayer = L.geoJSON(data, {
        style: {
          color: "#0000ff",
          weight: 2,
          fillColor: "#0000ff",
          fillOpacity: 0.25,
        },
      }).addTo(this.map);
    });
    this.getCatchmentData(
      mapClickEvent.latlng.lat,
      mapClickEvent.latlng.lng
    ).subscribe((data) => {
      if (this.catchmentLayer !== null) {
        this.map.removeLayer(this.catchmentLayer);
      }
      this.catchmentLayer = L.geoJSON(JSON.parse(data)).addTo(this.map);
    });
    if (this.searchStartStream !== null) {
      this.map.removeLayer(this.searchStartStream);
    }
    if (this.streamLayer !== null) {
      this.map.removeLayer(this.streamLayer);
    }
    if (this.stationLayer !== null) {
      this.map.removeLayer(this.stationLayer);
    }
    this.getStream(
      mapClickEvent.latlng.lat,
      mapClickEvent.latlng.lng
    ).subscribe((response) => {
      this.get_callback(null, response);
    });
  }

  getMapEvent(event) {
    return this.map.mouseEventToLatLng(event);
  }

  handleDrag(mapDragEvent): void {
    // console.log('mapDragEvent: ', mapDragEvent);
  }

  handleZoom(mapZoomEvent) {
    let zoom = this.map.getZoom();
    // console.log("zoom: ", zoom);
  }

  handleMove(mapMoveEvent) {
    // console.log("hover: ", mapMoveEvent);
    this.getHucData(
      "HUC_12",
      mapMoveEvent.latlng.lat,
      mapMoveEvent.latlng.lng
    ).subscribe((data) => {
      if (this.hoverLayer !== null) {
        this.map.removeLayer(this.hoverLayer);
      }
      this.hoverLayer = L.geoJSON(data, {
        style: {
          color: "#FF0000",
          weight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0,
        },
      }).addTo(this.map);
    });
  }

  getHucData(hucType, lat, lng): Observable<any> {
    var baseUrl = "";
    var point =
      '&geometry={"x":' +
      lng +
      ',"y":' +
      lat +
      ',"spatialReference":{"wkid":4326}}';
    var outFields = "";
    var params =
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
    var queryString = point + outFields + params;
    return this.getEPAWatersData(baseUrl, queryString);
  }

  getEPAWatersData(baseUrl, queryString): Observable<any> {
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

  getStream(lat, lng): Observable<any> {
    const service_url = "https://ofmpub.epa.gov/waters10/";

    let pPoint = "POINT(" + lng + " " + lat + ")"; // this is the point "POINT(lng lat)"
    let data = {
      // pGeometry: "POINT(" + lng + " " + lat + ")",
      pGeometry: pPoint,
      pGeometryMod: "WKT,SRSNAME=urn:ogc:def:crs:OGC::CRS84",
      pPointIndexingMethod: "DISTANCE",
      pPointIndexingRaindropDist: 0,
      pPointIndexingMaxDist: 25,
      pOutputPathFlag: "TRUE",
      pReturnFlowlineGeomFlag: "FALSE",
    };

    const request =
      service_url + "PointIndexing.Service?" + this.serialize(data);

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

  // Callback function on service completion
  get_callback(err, response): void {
    const service_url = "https://ofmpub.epa.gov/waters10/";
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

    var data = {
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
      .get(service_url + "UpstreamDownstream.Service?" + this.serialize(data))
      .subscribe((data) => {
        this.UD_get_callback(null, data);
      });
  }

  UD_get_callback(err, response) {
    let fl = response.output.flowlines_traversed;
    let streamColor = "#00F0F0";
    let startColor = "#FF0000";

    this.searchStartStream = L.geoJSON(fl[0].shape, {
      style: {
        color: startColor,
        weight: 2,
      },
    }).addTo(this.map);

    this.streamLayer = L.geoJSON().addTo(this.map);
    for (let i in fl) {
      let tmp_feature = L.geoJSON(fl[i].shape);
      this.streamLayer.addLayer(tmp_feature).setStyle({
        color: streamColor,
        weight: 4,
      });
    }

    // draw events_encountered
    this.stationLayer = L.geoJSON().addTo(this.map);
    if (response.output.events_encountered) {
      for (let i = 0; i < response.output.events_encountered.length; i++) {
        const sEvent = response.output.events_encountered[i];
        const sFeatureId = sEvent.source_featureid;
        const sProgram = sEvent.source_program;
        // console.log("event: ", sEvent);
        L.geoJSON(sEvent.shape).bindPopup(sFeatureId).addTo(this.stationLayer);
      }
    }

    // Bring search start segment to front
    this.searchStartStream.bringToFront();

    // centers map on result
    this.map.fitBounds(this.streamLayer.getBounds(), {
      maxZoom: 13,
    });
  }

  /* from https://github.com/Esri/esri-leaflet/blob/master/src/Request.js */
  serialize(params) {
    var data = "";

    params.f = params.f || "json";

    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        var param = params[key];
        var type = Object.prototype.toString.call(param);
        var value;

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

/* these are from https://ceamdev.ceeopdev.net/static_qed/hms/js/
  
function get_nhd_layer_queries(bbox){
    let base_url = nhd_plus_layers["url"];
    let huc_layers = nhd_plus_layers["layers"];
    let layer_queries = {};
    for(let [key, value] of Object.entries(huc_layers)){
        let q = "dynamicLayers=" + encodeURIComponent(JSON.stringify(value["dynamicLayers"])) +
            "&dpi=" + value["dpi"] +
            "&transparent=" + value["transparent"] +
            "&format=" + value["format"] +
            "&layers=" + value["layers"] +
            "&bbox=" + bbox["_southWest"]["lng"] + + "," + bbox["_southWest"]["lat"] + "," + bbox["_northEast"]["lng"] + "," + bbox["_northEast"]["lat"]  +
            "&bboxSR=900913" +
            "&imageSR=" + value["imageSR"] +          //900913
            "&size=" + value["size"] +
            "&_ts=" + value["_ts"] +
            "&f=" + value["f"];
        layer_queries[key] = base_url + q;
    }
    return layer_queries;
}

function getStreamData(lat, lng) {
    // COMID Request

    var url = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/Catchments_NP21_Simplified/MapServer/0/query?where=&text=&objectIds=&time=&geometry=%7B%22x%22+%3A+"
        + lng + "%2C+%22y%22+%3A+" + lat + "%2C+%22spatialReference%22+%3A+%7B%22wkid%22+%3A+4326%7D%7D&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelWithin&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=%7B%22wkt%22+%3A+%22GEOGCS%5B%5C%22GCS_WGS_1984%5C%22%2CDATUM%5B%5C%22D_WGS_1984%5C%22%2C+SPHEROID%5B%5C%22WGS_1984%5C%22%2C6378137%2C298.257223563%5D%5D%2CPRIMEM%5B%5C%22Greenwich%5C%22%2C0%5D%2C+UNIT%5B%5C%22Degree%5C%22%2C0.017453292519943295%5D%5D%22%7D&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=geojson";
    $.ajax({
        type: "GET",
        url: url,
        jsonp: true,
        async: false,
        success: function (data, status, jqXHR) {
            addCatchmentToMap(data);
        },
        error: function (jqXHR, status) {
            console.log("Error retrieving stream catchment data.");
        }
    });
    return false;
}

function getStreamDataByComID(comid) {
    // COMID Request
    var catchment_base_url = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/Catchments_NP21_Simplified/MapServer/0/query?where=FEATUREID=" + comid;
    var catchment_url_options = "&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=%7B%22wkt%22+%3A+%22GEOGCS%5B%5C%22GCS_WGS_1984%5C%22%2CDATUM%5B%5C%22D_WGS_1984%5C%22%2C+SPHEROID%5B%5C%22WGS_1984%5C%22%2C6378137%2C298.257223563%5D%5D%2CPRIMEM%5B%5C%22Greenwich%5C%22%2C0%5D%2C+UNIT%5B%5C%22Degree%5C%22%2C0.017453292519943295%5D%5D%22%7D&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=geojson";
    var url = catchment_base_url + catchment_url_options;
    $.ajax({
        type: "GET",
        url: url,
        jsonp: true,
        async: false,
        success: function (data, status, jqXHR) {
            addCatchmentToMap(data);
        },
        error: function (jqXHR, status) {
            console.log("Error retrieving stream catchment data.");
        }
    });
    return false;
}

// hucType => ["HUC_8", "HUC_12"]
function getHucData(hucType, lat, lng) {
    var baseUrl = "";
    var point = "&geometry={\"x\":" + lng + ",\"y\":" + lat + ",\"spatialReference\":{\"wkid\":4326}}";
    var outFields = "";
    var params = "&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&returnGeometry=true&returnTrueCurves=false&geometryPrecision=&outSR=%7B%22wkid%22+%3A+4326%7D&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=geojson";

    if (hucType === "HUC_12") {
        baseUrl = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/0/query?where=&text=&time=";
        outFields = "&outFields=OBJECTID%2C+Shape%2C+GAZ_ID%2C+AREA_ACRES%2C+AREA_SQKM%2C+STATES%2C+LOADDATE%2C+HUC_2%2C+HU_2_NAME%2C+HUC_4%2C+HU_4_NAME%2C+HUC_6%2C+HU_6_NAME%2C+HUC_8%2C+HU_8_NAME%2C+HUC_10%2C+HU_10_NAME%2C+HUC_12%2C+HU_12_NAME%2C+HU_12_TYPE%2C+HU_12_MOD%2C+NCONTRB_ACRES%2C+NCONTRB_SQKM%2C+HU_10_TYPE%2C+HU_10_MOD%2C+Shape_Length%2C+Shape_Area";
    }
        // else if (hucType === "HUC_10"){
        //     baseUrl = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/1/query?where=&text=&time=";
        //     outFields = "&outFields=OBJECTID%2C+Shape%2C+GAZ_ID%2C+AREA_ACRES%2C+AREA_SQKM%2C+STATES%2C+LOADDATE%2C+HUC_2%2C+HU_2_NAME%2C+HUC_4%2C+HU_4_NAME%2C+HUC_6%2C+HU_6_NAME%2C+HUC_8%2C+HU_8_NAME%2C+HUC_10%2C+HU_10_NAME%2C+NCONTRB_ACRES%2C+NCONTRB_SQKM%2C+HU_10_TYPE%2C+HU_10_MOD%2C+Shape_Length%2C+Shape_Area";
    // }
    else {
        hucType = "HUC_8";
        baseUrl = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/2/query?where=&text=&time=";
        outFields = "&outFields=OBJECTID%2C+Shape%2C+GAZ_ID%2C+AREA_ACRES%2C+AREA_SQKM%2C+STATES%2C+LOADDATE%2C+HUC_2%2C+HU_2_NAME%2C+HUC_4%2C+HU_4_NAME%2C+HUC_6%2C+HU_6_NAME%2C+HUC_8%2C+HU_8_NAME%2C+Shape_Length%2C+Shape_Area";
    }
    var queryString = point + outFields + params;
    getEPAWatersData(baseUrl, queryString, hucType)
}

function getHucDataById(hucID) {
    var baseUrl = "";
    var whereCondition = "";
    var outFields = "";
    var params = "&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=geojson";
    var queryString = "";
    if (hucID.length === 8) {
        baseUrl = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/2/query?";
        whereCondition = "where=HUC_8+LIKE+%28%27" + hucID + "%27%29";
        outFields = "&outFields=OBJECTID%2C+Shape%2C+GAZ_ID%2C+AREA_ACRES%2C+AREA_SQKM%2C+STATES%2C+LOADDATE%2C+HUC_2%2C+HU_2_NAME%2C+HUC_4%2C+HU_4_NAME%2C+HUC_6%2C+HU_6_NAME%2C+HUC_8%2C+HU_8_NAME%2C+Shape_Length%2C+Shape_Area";
        queryString = whereCondition + outFields + params;
        getEPAWatersData(baseUrl, queryString, "HUC_8");
    }
    else if (hucID.length === 12) {
        baseUrl = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/0/query?";
        whereCondition = "where=HUC_12+LIKE+%28%27" + hucID + "%27%29";
        outFields = "&outFields=OBJECTID%2C+Shape%2C+GAZ_ID%2C+AREA_ACRES%2C+AREA_SQKM%2C+STATES%2C+LOADDATE%2C+HUC_2%2C+HU_2_NAME%2C+HUC_4%2C+HU_4_NAME%2C+HUC_6%2C+HU_6_NAME%2C+HUC_8%2C+HU_8_NAME%2C+HUC_10%2C+HU_10_NAME%2C+HUC_12%2C+HU_12_NAME%2C+HU_12_TYPE%2C+HU_12_MOD%2C+NCONTRB_ACRES%2C+NCONTRB_SQKM%2C+HU_10_TYPE%2C+HU_10_MOD%2C+Shape_Length%2C+Shape_Area";
        queryString = whereCondition + outFields + params;
        getEPAWatersData(baseUrl, queryString, "HUC_12");
    }
}

function addCatchmentToMap(data) {
    if (currentSelectedGeometry !== null) {
        hucMap.removeLayer(currentSelectedGeometry);
    }
    var hucData = data;
    if (typeof data === "string") {
        hucData = JSON.parse(data);
    }
    currentSelectedGeometry = L.geoJSON(hucData);
    currentSelectedGeometry.addTo(hucMap);
    hucMap.fitBounds(currentSelectedGeometry.getBounds());
    var comid = hucData.features[0].properties.FEATUREID;
    $('#comid').val(comid);
    $('#selection_id').html(comid);
    $('#selection_huc12').html(hucData.features[0].properties.WBD_HUC12);
    $('#selection_area').html(Number(hucData.features[0].properties.AREASQKM).toFixed(4));
    $('#selection_region').html(hucData.features[0].properties.NHDPLUS_REGION);
    $('#add_spatial_input').removeClass("blocked");
    setTimeout(function () {
        if (addPopup !== null) {
            hucMap.removeLayer(addPopup);
        }
        addPopup = L.popup({
            keepInView: true,
        }).setLatLng(hucMap.getCenter())
            .setContent('<button id="huc_map_button_add" type="button" onclick="addSpatialInput(); toggleHucMap(); return false;">Add Catchment: ' + comid + '</button>')
            .openOn(hucMap);
    }, 600);
}

function addHucToMap(data, hucType) {
    if (currentSelectedGeometry !== null) {
        hucMap.removeLayer(currentSelectedGeometry);
    }
    var hucData = data;
    if (typeof data === "string") {
        hucData = JSON.parse(data);
    }
    var hucNum = hucType.slice(4, hucType.length);
    var hucID = hucData.features[0].properties[hucType];
    currentSelectedGeometry = L.geoJSON(hucData);
    currentSelectedGeometry.addTo(hucMap);
    $('#selection_id').html(hucID);
    $('#selection_name').html(hucData.features[0].properties["HU_" + hucNum + "_NAME"]);
    $('#selection_area').html(Number(hucData.features[0].properties.AREA_SQKM).toFixed(4));
    $('#selection_state').html(hucData.features[0].properties.STATES);
    hucMap.fitBounds(currentSelectedGeometry.getBounds());
    $('#huc_id').val(hucID);
    $('#add_spatial_input').removeClass("blocked");
    setTimeout(function () {
        if (addPopup !== null) {
            hucMap.removeLayer(addPopup);
        }
        addPopup = L.popup({
            keepInView: true,
        }).setLatLng(hucMap.getCenter())
            .setContent('<button id="huc_map_button_add" type="button" onclick="addSpatialInput(); toggleHucMap(); return false;">Add HUC: ' + hucID + '</button>')
            .openOn(hucMap);
    }, 600);
}

function getEPAWatersData(url, params, hucType) {
    $.ajax({
        type: "GET",
        url: url + params,
        jsonp: true,
        async: false,
        success: function (data, status, jqXHR) {
            addHucToMap(data, hucType);
        },
        error: function (jqXHR, status) {
            console.log("Error retrieving stream segment data.");
        }
    });
}
  
*/
