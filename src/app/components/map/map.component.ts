import { Component, EventEmitter, Output } from '@angular/core';

import * as L from 'leaflet';
import * as ESRI from 'esri-leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent {
  @Output() mapClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() layerUpdate: EventEmitter<any> = new EventEmitter<any>();

  defaultBasemap = 'Open Street Map';
  basemaps = [
    {
      name: 'Open Street Map',
      layer: L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
    },
    {
      name: 'Open Topo Map',
      layer: L.tileLayer(
        'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', 
        {
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        })
    },
    {
      name: 'No basemap',
      layer: L.tileLayer('',
        {
          attribution: '(<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        })
    }
  ]

  defaultFeatureLayer = 'huc8';
  features = [
    { 
      name: 'flowlines',
      color: '#00FFFF',
      weight: 1,
      fillOpacity: 0,
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/NHDSnapshot_NP21/MapServer/0",
    },
    { 
      name: "catchments", 
      color: 'green',
      weight: 1,
      fillOpacity: 0,
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/Catchments_NP21_Simplified/MapServer/0"
    },
    { 
      name: 'huc12',
      color: '#0026FF',
      weight: 1,
      fillOpacity: 0,
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/0"
    },
    { 
      name: 'huc10', 
      color: '#4800FF',
      weight: 1,
      fillOpacity: 0,
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/1"
    },
    { 
      name: 'huc8', 
      color: '#B200FF',
      weight: 2,
      fillOpacity: 0,
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/2"
    },
    { 
      name: 'huc6', 
      color: '#FF00DC',
      weight: 4,
      fillOpacity: 0,
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/3"
    },
    { 
      name: 'huc4', 
      color: '#FF006E',
      weight: 6,
      fillOpacity: 0,
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/4"
    },
    { 
      name: 'huc2', 
      color: '#FF0000',
      weight: 8,
      fillOpacity: 0,
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/5"
    },
  ]

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

  constructor(
  ) {}

  ngOnInit() {
    // setup map
    if(!this.map) {
      this.map = L.map("map", {
        center: [37.31, -92.1],  // US geographical center
        zoom: 8,
        minZoom: 5,
      });
      this.map.on("click", (mapClickEvent) => {
        this.handleClick(mapClickEvent);
      });
      this.map.on('zoomend', (mapZoomEvent) => {
        this.handleZoom(mapZoomEvent);
      });
    }

    // setup tile maps
    for (let basemap of this.basemaps) {
      this.basemapLayers.push({
        type: 'basemap',
        name: basemap.name,
        layer: basemap.layer,
        show: false,
      });
    }
    
    // setup feature layers
    for (let url of this.features) {
      let layer = ESRI.featureLayer({
        url: url.url,
      });
      layer.setStyle({
        color: url.color,
        weight: url.weight,
        fillOpacity: url.fillOpacity,
      });
      this.featureLayers.push({
        type: 'feature',
        name: url.name,
        layer: layer,
        show: false,
      });
    }
    this.addDefaultLayers();
  }

  addDefaultLayers(): void {
    for (let map of this.basemapLayers) {
      if (map.name == this.defaultBasemap) {
        this.map.addLayer(map.layer);
        map.show = true;
      }
    }
    for (let feature of this.featureLayers) {
      if (feature.name == this.defaultFeatureLayer) {
        this.map.addLayer(feature.layer);
        feature.show = true;
      }
    }
  }

  toggleLayer(type, name): void {
    switch(type) {
      case 'basemap':
        for (let map of this.basemapLayers) {
          if (map.name == name) {
            map.show = !map.show;
          }
          if (map.show) {
            this.map.addLayer(map.layer);
          } else {
            this.map.removeLayer(map.layer);
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
  controlClicked(mapControlEvent): void {
    switch(mapControlEvent.type) {
      case 'toggle':
        this.toggleLayer(mapControlEvent.layerType, mapControlEvent.name);
        break;
      case 'refresh':
        this.layerUpdate.emit({ basemaps: this.basemapLayers, features: this.featureLayers });
        break;
      default:
        console.log('UNKNOWN MAP_CONTROL_EVENT_TYPE: ', mapControlEvent.type);
    }
  }

  // this is an incoming message from the input form
  requestSent(requestFromInputForm): void {
    // requestFromInputForm.mapCoords === true
    // there will be an incomplete form,
    // but it will include a lat/lng pair
    if (requestFromInputForm.mapCoords) {
      this.map.setZoom(8);
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

