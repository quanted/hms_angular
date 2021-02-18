import { Component } from '@angular/core';

import * as L from 'leaflet';

import { LayerService } from 'src/app/services/layer.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent {
  /* STORET webservices */
  url_stations_base = 'https://www.waterqualitydata.us/data/Station/search?';

  /* NHD+ */
  // catchments
  url_NP21_catchments = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/Catchments_NP21_Simplified/MapServer/0";
  // HUC
  url_NP21_allLayers = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/layers;f=pjson";
  url_NP21_huc12 = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/0";
  url_NP21_huc10 = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/1";
  url_NP21_huc8 = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/2";
  url_NP21_huc6 = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/3";
  url_NP21_huc4 = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/4";
  url_NP21_huc2 = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/5";
  // flowlines
  url_NP21_flowlines = "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/NHDSnapshot_NP21/MapServer/0";
  // water monitoring locations
  url_NP21_monitor_locations = "https://watersgeo.epa.gov/arcgis.rest/services/NHDPlus_NP21/STORET_NP21/MapServer/0";

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

  constructor(private layerService: LayerService) {}

  ngOnInit() {
    if(!this.map) {
      this.map = L.map("map", {
        center: [37.31, -92.1],  // US geographical center
        zoom: 5,
      });
      this.map.on("click", ($event) => {
        this.handleClick($event);
      });
      this.openStreetMap.addTo(this.map);
      
      L.control.layers(this.baseLayers, this.overlays).addTo(this.map);
      L.control.scale().addTo(this.map);
    }
  }

  handleClick($event) {
    console.log($event);
  }
}

