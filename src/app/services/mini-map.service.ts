import { Injectable } from '@angular/core';
import { HmsService } from './hms.service';
import { WatersService } from './waters.service';
import { LayerService } from './layer.service';
import * as L from "leaflet";
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class MiniMapService {
  map: L.Map;
  simData: any;
  segmentLayers: any[];
  comidClickSubject = new Subject<string>();
  comidHoverSubject = new Subject<string>();
  comid: string;

  constructor(
    private hms: HmsService,
    private waters: WatersService,
    private layerService: LayerService,
    private route: ActivatedRoute) { }

  initMap(simData: any): void {
    // Get comid and set droplist data
    if (this.route.snapshot.paramMap.has("comid")) {
      this.comid = this.route.snapshot.paramMap.get("comid");
    }
    this.simData = simData;
    // If map already exists, remove 
    if (this.map) {
      this.map.remove();
    }
    // Check that DOM element with id mini map exists before creating map
    if (document.getElementById("mini-map")) {
      this.map = L.map("mini-map", {
        center: [38.5, -96], // US geographical center
        zoom: 10,
        minZoom: 5,
        zoomControl: false,
        attributionControl: false
      });
      this.setupLayers();
    }
  }

  setupLayers() {
    this.map.addLayer(
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC",
        },
      ));

    this.hms.getCatchmentInfo(this.simData.network.pour_point_comid).subscribe(
      (data) => {
        if (data.metadata) {
          // now get the huc by coords
          const coords = {
            lat: data.metadata.CentroidLatitude,
            lng: data.metadata.CentroidLongitude,
          };
          this.waters.getHucData("HUC_12", coords.lat, coords.lng).subscribe(
            (data) => {
              // if the error callback is called then data will be null
              if (data) {
                if (!data.error) {
                  this.addHUC(data);
                }
              }
            });
        }
      });
  }

  buildStreamLayers() {
    this.segmentLayers = [];

    // Pour point
    if (this.simData.network.segments.pourPoint) {
      const pourPointLayer = L.featureGroup().addTo(this.map);
      const pourPoint = this.simData.network.segments.pourPoint;

      const layerStyle = {
        color: this.layerService.pourPointColor,
        weight: this.layerService.segmentLineSize,
      };

      const segmentLayer = this.createSimLayer(pourPoint, { ...layerStyle });
      this.segmentLayers.push({
        comid: pourPoint.comid,
        layer: segmentLayer,
        name: "pourPoint",
      });
      segmentLayer.addTo(pourPointLayer);
    }

    // inNetwork
    if (this.simData.network.segments.inNetwork.length) {
      const inNetworkLayer = L.featureGroup().addTo(this.map);
      const inNetwork = this.simData.network.segments.inNetwork;

      const layerStyle = {
        color: this.layerService.inNetworkColor,
        weight: this.layerService.segmentLineSize,
      };

      for (let segment of inNetwork) {
        const segmentLayer = this.createSimLayer(segment, { ...layerStyle });
        this.segmentLayers.push({
          comid: segment.comid,
          layer: segmentLayer,
          name: "inNetwork",
        });
        segmentLayer.addTo(inNetworkLayer);
      }
      inNetworkLayer["options"]["style"] = {
        color: this.layerService.inNetworkColor,
        weight: this.layerService.segmentLineSize,
      };
    }

    // headwater
    if (this.simData.network.segments.headwater.length) {
      const headwaterLayer = L.featureGroup().addTo(this.map);
      const headwater = this.simData.network.segments.headwater;

      const layerStyle = {
        color: this.layerService.headwaterColor,
        weight: this.layerService.segmentLineSize,
      };

      for (let segment of headwater) {
        const segmentLayer = this.createSimLayer(segment, { ...layerStyle });
        this.segmentLayers.push({
          comid: segment.comid,
          layer: segmentLayer,
          name: "headwater",
        });
        segmentLayer.addTo(headwaterLayer);
      }
      headwaterLayer["options"]["style"] = {
        color: this.layerService.headwaterColor,
        weight: this.layerService.segmentLineSize,
      };
    }

    // boundary
    if (this.simData.network.segments.boundary.length) {
      const boundaryLayer = L.featureGroup().addTo(this.map);
      const boundary = this.simData.network.segments.boundary;

      const layerStyle = {
        color: this.layerService.boundaryColor,
        weight: this.layerService.segmentLineSize,
      };

      for (let segment of boundary) {
        const segmentLayer = this.createSimLayer(segment, { ...layerStyle });
        this.segmentLayers.push({
          comid: segment.comid,
          layer: segmentLayer,
          name: "boundary",
        });
        segmentLayer.addTo(boundaryLayer);
      }
    }
  }

  addHUC(feature) {
    let layer;
    layer = L.geoJSON(feature, {
      interactive: false,
      style: {
        color: this.layerService.hucColor,
        weight: 1,
        fillColor: this.layerService.hucColor,
        fillOpacity: 0,
      },
    });
    layer.addTo(this.map);
    this.map.setMaxBounds(layer.getBounds());
    this.buildStreamLayers();
  }

  createSimLayer(segmentData, style): any {
    if (segmentData.comid == this.comid)
      style.color = this.layerService.selectedColor;
    const simLayer = L.geoJSON(segmentData.shape, {
      style,
    });
    simLayer.on("click", (e) => {
      this.comidClickSubject.next(segmentData.comid);
    });
    simLayer.on("mouseover", (e) => {
      this.hoverSegment(segmentData.comid);
    });
    simLayer.on("mouseout", (e) => {
      this.comidHoverSubject.next(segmentData.comid);
    });
    simLayer.bindTooltip(`comID: ${segmentData.comid}`, {
      sticky: true,
    });
    return simLayer;
  }

  selectSegment(catchment: any): void {
    const layer = this.segmentLayers.find(layer => layer.comid == catchment.catchment);
    switch (layer.name) {
      case "inNetwork":
        layer.layer.setStyle({
          color: catchment.selected ? this.layerService.selectedColor : this.layerService.inNetworkColor,
          weight: this.layerService.segmentLineSize,
        });
        break;
      case "boundary":
        layer.layer.setStyle({
          color: catchment.selected ? this.layerService.selectedColor : this.layerService.boundaryColor,
          weight: this.layerService.segmentLineSize,
        });
        break;
      case "headwater":
        layer.layer.setStyle({
          color: catchment.selected ? this.layerService.selectedColor : this.layerService.headwaterColor,
          weight: this.layerService.segmentLineSize,
        });
        break;
      case "pourPoint":
        layer.layer.setStyle({
          color: catchment.selected ? this.layerService.selectedColor : this.layerService.pourPointColor,
          weight: this.layerService.segmentLineSize,
        });
        break;
      default:
        console.log(`ERROR: selectSegment.UNKNOWN_LAYER_NAME ${layer.name}`);
    }
  }

  hoverSegment(catchment: string): void {
    const layer = this.segmentLayers.find(layer => layer.comid == catchment);
    layer.layer.setStyle({
      color: "#ffb01f",
      weight: this.layerService.segmentLineSize,
    });
  }
}
