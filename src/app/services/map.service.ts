import { Injectable } from "@angular/core";

import * as L from "leaflet";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { LayerService } from "src/app/services/layer.service";
import { HmsService } from "./hms.service";
import { SimulationService } from "./simulation.service";
import { WatersService } from "./waters.service";

@Injectable({
  providedIn: "root",
})
export class MapService {
  map: L.Map;

  // State variables, interface steps
  hucSelected = false;
  catchmentSelected = false;

  constructor(
    private hms: HmsService,
    private waters: WatersService,
    private layerService: LayerService,
    private simulation: SimulationService
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
    }
    this.layerService.setupLayers(this.map);
    document.getElementById("map").style.cursor = "crosshair";
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

  removeFeature(type, id): void {
    this.layerService.removeFeature(id);
    if (type == "huc") this.hucSelected = false;
    if (type == "catchment") {
      this.catchmentSelected = false;
      this.layerService.removeStream();
    }
  }

  getHuc(coords): void {
    this.hucSelected = true;
    this.waters
      .getHucData("HUC_12", coords.lat, coords.lng)
      .subscribe((data) => {
        if (data) {
          this.simulation.updateSimData("coords", coords);
          const properties = data.features[0].properties;
          this.simulation.updateSimData("huc", {
            areaAcres: properties.AREA_ACRES,
            areaSqKm: properties.AREA_SQKM,
            id: properties.HUC_12,
            name: properties.HU_12_NAME,
            ...properties,
          });
          this.layerService.addFeature(
            data.features[0].properties.HUC_12,
            data
          );
        } else {
          this.hucSelected = false;
        }
      });
  }

  getCatchment(coords): void {
    this.catchmentSelected = true;
    this.waters.getCatchmentData(coords.lat, coords.lng).subscribe((data) => {
      if (data) {
        const properties = data.features[0].properties;
        this.simulation.updateSimData("catchment", {
          areaSqKm: properties.AREASQKM,
          id: properties.FEATUREID,
          ...properties,
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

  buildStreamNetwork(comid, distance): Observable<any> {
    return this.waters.getStreamNetworkData(comid, distance).pipe(
      map((data) => {
        this.hms.getStreamNetwork(comid, distance).subscribe((network) => {
          this.simulation.updateSimData("network", network);
        });
        this.layerService.buildStreamLayers(data);
        return data;
      })
    );
  }
}
