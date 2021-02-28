import { Component, EventEmitter, Output } from '@angular/core';

import * as L from 'leaflet';
import * as ESRI from 'esri-leaflet';

import { LayerService } from 'src/app/services/layer.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent {
  @Output() mapClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() layerUpdate: EventEmitter<any> = new EventEmitter<any>();

  map: L.Map;

  // flag = L.icon({
  //   iconUrl: "../assets/images/icon_flag.png",
  //   iconSize: [32, 32], // size of the icon
  //   iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
  // });

  basemapLayers = [
    // "Map Name": L.tileLayer,
  ]

  featureLayers = [
    // "Marker": ESRI.featureLayer,
  ];

  defaultBasemap = 'Open Street Map';
  defaultFeatureLayer = 'huc8';

  constructor(
    private layerService: LayerService,
  ) {}

  ngOnInit() {
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
    this.layerUpdate.emit({ basemaps: this.basemapLayers, features: this.featureLayers });
  }
  // handles map interactions
  handleClick(mapClickEvent) {
    // input form is listening for this
    // it uses this event to populate the lat/lng form controls
    this.mapClick.emit(mapClickEvent);
  }
  // control clicked message from map-control
  controlClicked(commandMessage): void {
    switch(commandMessage.command) {
      case 'toggle':
        this.toggleLayer(commandMessage.layerType, commandMessage.name);
        break;
      case 'refresh':
        this.layerUpdate.emit({ basemaps: this.basemapLayers, features: this.featureLayers });
        break;
      default:
        console.log('UNKNOWN COMMAND_TYPE: ', commandMessage.command);
    }
  }
  // this is an incoming message from the input form
  requestSent(requestFromInputForm): void {
    // requestFromInputForm.mapCoords === true
    // there will be an incomplete form,
    // but it will include a lat/lng pair
    if (requestFromInputForm.mapCoords) {
      this.map.setZoom(5);
      this.map.flyTo(requestFromInputForm.mapCoords);
    } else {
      console.log('inputForm.value: ', requestFromInputForm);
    }
  }

  handleZoom(mapZoomEvent) {
    let zoom = this.map.getZoom();
    console.log('zoom: ', zoom);
  }
}