import { Injectable } from '@angular/core';

import * as L from 'leaflet';

import { LayerService } from 'src/app/services/layer.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {basemapLayers = [
    // "Map Name": L.tileLayer,
  ]

  featureLayers = [
    // "Marker": ESRI.featureLayer,
  ];

  defaultBasemap = 'Open Street Map';
  defaultFeatureLayer = 'huc8';

  map: L.Map;

  // flag = L.icon({
  //   iconUrl: "../assets/images/icon_flag.png",
  //   iconSize: [32, 32], // size of the icon
  //   iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
  // });

  constructor(
    private layerService: LayerService,
  ) {}

  ngOnInit() {
  }

  initMap(): void {
    // setup map
    if(!this.map) {
      this.map = L.map("map", {
        center: [38.5, -96],  // US geographical center
        zoom: 5,
        minZoom: 5,
      });
      this.map.on("click", (mapClickEvent) => {
        this.handleClick(mapClickEvent);
      });
      this.map.on('zoomend', (mapZoomEvent) => {
        this.handleZoom(mapZoomEvent);
      });
    }
    this.setupLayers();

  }

  setupLayers() {
    this.basemapLayers = this.layerService.getBasemapLayers();
    this.featureLayers = this.layerService.getFeatureLayers();
    this.addDefaultLayers();
  }

  addDefaultLayers(): void {
    for (let map of this.basemapLayers) {
      if (map.name == this.defaultBasemap) {
        this.map.addLayer(map.layer);
        map.show = true;
      }
    }
  }

  toggleLayer(type, name): void {
    console.log(type);
    console.log(name);
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

  handleClick(mapClickEvent): void {

  }

  handleZoom(mapZoomEvent) {
    let zoom = this.map.getZoom();
    console.log('zoom: ', zoom);
  }
}
