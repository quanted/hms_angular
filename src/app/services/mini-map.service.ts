import { Injectable } from '@angular/core';
import { SimulationService } from './simulation.service';
import { LayerService } from './layer.service';
import * as L from "leaflet";


@Injectable({
  providedIn: 'root',
})
export class MiniMapService {
  map: L.Map;

  constructor(
    private simulation: SimulationService,
    private layerService: LayerService) { }

  initMap(): void {
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
        }
      ));
  }
}
