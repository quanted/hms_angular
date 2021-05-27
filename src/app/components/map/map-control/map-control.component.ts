import { Component, OnInit } from "@angular/core";

import { LayerService } from "src/app/services/layer.service";

@Component({
  selector: "app-map-control",
  templateUrl: "./map-control.component.html",
  styleUrls: ["./map-control.component.css"],
})
export class MapControlComponent implements OnInit {
  basemaps = [];
  features = [];

  constructor(private layerService: LayerService) {}

  ngOnInit(): void {
    const layers = this.layerService.getLayers();
    this.basemaps = layers.basemaps;
    this.features = layers.features;
  }

  toggleBasemap(controlButton): void {
    this.layerService.toggleLayer(controlButton.type, controlButton.name);
  }
}
