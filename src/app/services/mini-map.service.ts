import { Injectable } from '@angular/core';
import { HmsService } from './hms.service';
import { WatersService } from './waters.service';
import { LayerService } from './layer.service';
import * as L from "leaflet";


@Injectable({
  providedIn: 'root',
})
export class MiniMapService {
  map: L.Map;
  simData: any;

  constructor(
    private hms: HmsService,
    private waters: WatersService,
    private layerService: LayerService) { }

  initMap(simData: any): void {
    this.simData = simData;
    if (this.map) {
      this.map.remove();
    }
    this.map = L.map("mini-map", {
      center: [38.5, -96], // US geographical center
      zoom: 10,
      minZoom: 5,
      zoomControl: false,
      attributionControl: false
    });
    this.map.on("click", (mapClickEvent) => {
      this.handleClick(mapClickEvent);
    });
    this.setupLayers();
  }

  handleClick(mapClickEvent): void {
    console.log("click")
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
                  this.addFeature(data);
                }
              }
            });
        }
      });
  }

  buildStreamLayers() {
    if (this.simData.network.segments.pourPoint) {
      const pourPointLayer = L.featureGroup().addTo(this.map);
      const pourPoint = this.simData.network.segments.pourPoint;

      const layerStyle = {
        color: this.layerService.pourPointColor,
        weight: this.layerService.segmentLineSize,
      };

      const segmentLayer = this.layerService.createSimLayer(pourPoint, layerStyle);
      segmentLayer.addTo(pourPointLayer);
    }

    if (this.simData.network.segments.inNetwork.length) {
      const inNetworkLayer = L.featureGroup().addTo(this.map);
      const inNetwork = this.simData.network.segments.inNetwork;

      const layerStyle = {
        color: this.layerService.inNetworkColor,
        weight: this.layerService.segmentLineSize,
      };

      for (let segment of inNetwork) {
        const segmentLayer = this.layerService.createSimLayer(segment, layerStyle);
        segmentLayer.addTo(inNetworkLayer);
      }
      inNetworkLayer["options"]["style"] = {
        color: this.layerService.inNetworkColor,
        weight: this.layerService.segmentLineSize,
      };
    }

    if (this.simData.network.segments.headwater.length) {
      const headwaterLayer = L.featureGroup().addTo(this.map);
      const headwater = this.simData.network.segments.headwater;

      const layerStyle = {
        color: this.layerService.headwaterColor,
        weight: this.layerService.segmentLineSize,
      };

      for (let segment of headwater) {
        const segmentLayer = this.layerService.createSimLayer(segment, layerStyle);
        segmentLayer.addTo(headwaterLayer);
      }
      headwaterLayer["options"]["style"] = {
        color: this.layerService.headwaterColor,
        weight: this.layerService.segmentLineSize,
      };
    }

    if (this.simData.network.segments.boundary.length) {
      const boundaryLayer = L.featureGroup().addTo(this.map);
      const boundary = this.simData.network.segments.boundary;

      const layerStyle = {
        color: this.layerService.boundaryColor,
        weight: this.layerService.segmentLineSize,
      };

      for (let segment of boundary) {
        const segmentLayer = this.layerService.createSimLayer(segment, layerStyle);
        segmentLayer.addTo(boundaryLayer);
      }
    }
  }

  addFeature(feature) {
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
}
