import { Injectable } from '@angular/core';

import * as L from 'leaflet';

import { LayerService } from 'src/app/services/layer.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  basemapLayers = [/* "Map Name": L.tileLayer, */]
  featureLayers = [/* "Marker": ESRI.featureLayer, */];

  defaultBasemap = 'Open Street Map';

  map: L.Map;

  // flag = L.icon({
  //   iconUrl: "../assets/images/icon_flag.png",
  //   iconSize: [32, 32], // size of the icon
  //   iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
  // });

  constructor(
    private layerService: LayerService,
  ) {}

  initMap(): void {
    // setup map
    if(!this.map) {
      this.map = L.map("map", {
        center: [38.5, -96],  // US geographical center
        zoom: 10,
        minZoom: 5,
      });
      this.map.on("click", (mapClickEvent) => {
        this.handleClick(mapClickEvent);
      });
      this.map.on("drag", (mapDragEvent) => {
        this.handleDrag(mapDragEvent);
      });
      this.map.on('zoomend', (mapZoomEvent) => {
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
      features: this.featureLayers
    }
  }

  toggleLayer(type, name): void {
    switch(type) {
      case 'basemap':
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
      case 'feature':
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
        console.log('UNKNOWN MAP_LAYER_TYPE: ', type);
    }
  }

  updateStyle(command) {
    this.layerService.updateFeatureStyle(command.name, command.style);
  }

  controlCommand(command): void {
    switch(command.command) {
      case 'toggle':
        this.toggleLayer(command.layerType, command.name);
        break;
      case 'update-style':
        this.updateStyle(command);
        break;
      case 'refresh':
        break;
      default:
        console.log('UNKNOWN CONTROL_COMMAND: ', command)
    }
  }

  handleClick(mapClickEvent): void {
    console.log('mapClickEvent: ', mapClickEvent);
  }

  handleDrag(mapDragEvent): void {
    // console.log('mapDragEvent: ', mapDragEvent);
  }

  handleZoom(mapZoomEvent) {
    let zoom = this.map.getZoom();
    console.log('zoom: ', zoom);
  }
}
