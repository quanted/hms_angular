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

  defaultFeatureLayer = 'huc8';
  features_URLS = [
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

  map: L.Map;

  // flag = L.icon({
  //   iconUrl: "../assets/images/icon_flag.png",
  //   iconSize: [32, 32], // size of the icon
  //   iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
  // });

  featureLayers = {
  //   "Marker": marker,
  //   "Roads": roadsLayer
  };

  basemapLayers = {
    // "Map Name": "map layer",
  }

  constructor(
  ) {}

  ngOnInit() {
    if(!this.map) {
      this.map = L.map("map", {
        center: [37.31, -92.1],  // US geographical center
        zoom: 8,
        minZoom: 5,
      });
      this.map.on("click", ($event) => {
        this.handleClick($event);
      });
      this.map.on('zoomend', ($event) => {
        this.handleZoom($event);
      });
    }
    for (let basemap of this.basemaps) {
      this.basemapLayers[basemap.name] = basemap.layer;
    }
    this.basemapLayers[this.defaultBasemap].addTo(this.map);
    for (let url of this.features_URLS) {
          let layer = ESRI.featureLayer({
            url: url.url,
          });
          layer.setStyle({
            color: url.color,
            weight: url.weight,
            fillOpacity: url.fillOpacity,
          });
          this.featureLayers[url.name] = layer;
    }
    this.featureLayers[this.defaultFeatureLayer].addTo(this.map);
      
    L.control.layers(this.basemapLayers, this.featureLayers, {
      collapsed: false,
    }).addTo(this.map);
    L.control.scale().addTo(this.map);
  }

  handleClick($event) {
    this.mapClick.emit($event);
  }

  requestSent($event): void {
    if ($event.mapCoords) {
      this.map.setZoom(8);
      this.map.flyTo($event.mapCoords);
    } else {
      console.log('inputForm.value: ', $event);
    }
  }

  handleZoom($event) {
    let zoom = this.map.getZoom();
    console.log('zoom: ', zoom);
  }
}

