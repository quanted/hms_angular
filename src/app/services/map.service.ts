import { Injectable } from "@angular/core";

import * as L from "leaflet";

import { LayerService } from "src/app/services/layer.service";
import { SimulationService } from "./simulation.service";
import { WatersService } from "./waters.service";

@Injectable({
  providedIn: "root",
})
export class MapService {
  map: L.Map;

  // State letiables interface steps
  hucSelected = false;
  catchmentSelected = false;

  constructor(
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
    this.waters.getCatchmentData(coords.lat, coords.lng).subscribe((data) => {
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

  buildStreamNetwork(comid): void {
    this.waters.getStreamNetwork(comid).subscribe((data) => {
      this.layerService.buildStreamLayer(data);
    });
  }
}
