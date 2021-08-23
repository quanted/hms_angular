import { Injectable } from "@angular/core";

import { Observable, forkJoin } from "rxjs";
import { map } from "rxjs/operators";

import * as L from "leaflet";

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
    if (type == "huc") {
      this.hucSelected = false;
      this.layerService.removeHuc();
    }
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
          this.layerService.addFeature("HUC", data);
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
        this.simulation.updateSimData("pour_point_comid", properties.FEATUREID);
        this.simulation.updateSimData("catchment", {
          areaSqKm: properties.AREASQKM,
          id: properties.FEATUREID,
          ...properties,
        });
        this.layerService.addFeature("Catchment", data);
      } else {
        this.catchmentSelected = false;
      }
    });
  }

  buildStreamNetwork(comid, distance): Observable<any> {
    return forkJoin([
      this.waters.getStreamNetworkData(comid, distance).pipe(
        map((data) => {
          this.layerService.buildStreamLayers(data);
          return data;
        })
      ),
      this.hms.getStreamNetwork(comid, distance).pipe(
        map((data) => {
          // strip off the boundaries key
          let tempsources = {};
          for (let key of Object.keys(data.sources)) {
            if (key != "boundaries") {
              tempsources[key] = data.sources[key];
            }
          }
          data.sources = tempsources;
          this.simulation.updateSimData("network", data);
          return data;
        })
      ),
    ]);
  }
}
