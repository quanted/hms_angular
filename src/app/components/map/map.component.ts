import { HttpClient } from '@angular/common/http';
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

  layers_URLS = [
    { 
      name: 'flowlines', 
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/NHDSnapshot_NP21/MapServer/0"
    },
    { 
      name: "catchments", 
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/Catchments_NP21_Simplified/MapServer/0"
    },
    { 
      name: 'huc12',
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/0"
    },
    { 
      name: 'huc10', 
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/1"
    },
    { 
      name: 'huc8', 
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/2"
    },
    { 
      name: 'huc6', 
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/3"
    },
    { 
      name: 'huc4', 
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/4"
    },
    { 
      name: 'huc2', 
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/5"
    },
  ]

  map: L.Map;

  openStreetMap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }
  );

  openTopoMap = L.tileLayer(
    'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', 
    {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }
  );

  // flag = L.icon({
  //   iconUrl: "../assets/images/icon_flag.png",
  //   iconSize: [32, 32], // size of the icon
  //   iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
  // });

  baseLayers = {
    "Open Street Map": this.openStreetMap,
    "Open Topo Map": this.openTopoMap
  };

  overlays = {
  //   "Marker": marker,
  //   "Roads": roadsLayer
  };

  constructor(
    private http: HttpClient
  ) {}

  ngOnInit() {
    for (let url of this.layers_URLS) {
          let layer = ESRI.featureLayer({
            url: url.url,
          });
          layer.setStyle({
            color: "red",
            weight: 1,
            fillOpacity: 0,
          });
          this.overlays[url.name] = layer;
    }
    if(!this.map) {
      this.map = L.map("map", {
        center: [37.31, -92.1],  // US geographical center
        zoom: 8,
      });
      this.map.on("click", ($event) => {
        this.handleClick($event);
      });
      this.map.on('zoomend', ($event) => {
        this.handleZoom($event);
      });
      this.openStreetMap.addTo(this.map);
    }
    this.overlays['huc8'].addTo(this.map);
      
    L.control.layers(this.baseLayers, this.overlays, {
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
    // console.log('zoom: ', $event);
    let zoom = this.map.getZoom();
  }
}

