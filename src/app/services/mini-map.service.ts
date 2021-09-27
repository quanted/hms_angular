import { Injectable } from '@angular/core';
import { SimulationService } from './simulation.service';
import { LayerService } from './layer.service';
import * as L from "leaflet";


@Injectable({
  providedIn: 'root'
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
    });
    this.map.on("click", (mapClickEvent) => {
      this.handleClick(mapClickEvent);
    });
    this.layerService.setupLayers(this.map);
  }

  handleClick(mapClickEvent): void {
    console.log("click")
  }
}
