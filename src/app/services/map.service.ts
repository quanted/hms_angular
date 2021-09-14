import { Injectable } from "@angular/core";

import * as L from "leaflet";

import { LayerService } from "src/app/services/layer.service";
import { SimulationService } from "./simulation.service";

@Injectable({
    providedIn: "root",
})
export class MapService {
    map: L.Map;

    constructor(private layerService: LayerService, private simulation: SimulationService) {}

    initMap(): void {
        this.map = L.map("map", {
            center: [38.5, -96], // US geographical center
            zoom: 10,
            minZoom: 5,
            zoomControl: false,
        });
        this.map.on("click", (mapClickEvent) => {
            this.handleClick(mapClickEvent);
        });
        this.layerService.setupLayers(this.map);

        // move this to css
        document.getElementById("map").style.cursor = "crosshair";
    }

    handleClick(mapClickEvent): void {
        if (!this.simulation.isHucSelected()) {
            this.getHuc(mapClickEvent.latlng);
        } else {
            if (this.simulation.isHucSelected() && !this.simulation.isCatchmentSelected()) {
                this.getCatchment(mapClickEvent.latlng);
            }
        }
    }

    getHuc(coords): void {
        this.simulation.getHuc(coords);
    }

    getCatchment(coords): void {
        this.simulation.getCatchment(coords);
    }
}
