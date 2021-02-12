import { Component } from '@angular/core';

import * as L from 'leaflet';

import { LayerService } from 'src/app/services/layer.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent {
  map: L.Map;

  baseTileset = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "",
    }
  );

  // flag = L.icon({
  //   iconUrl: "../assets/images/icon_flag.png",
  //   iconSize: [32, 32], // size of the icon
  //   iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
  // });

  mapProperties: any = {
    basemap: "streets",
  };

  mapViewProperties: any = {
    center: [37.31, -92.1],
    zoom: 5,
  };

  constructor(private layerService: LayerService) {}

  ngOnInit() {
    if(!this.map) {
      this.map = L.map("map");
      this.map.on("click", ($event) => {
        console.log($event);
      });
      this.baseTileset.addTo(this.map);
    }
    this.map.setView(
      this.mapViewProperties.center,
      this.mapViewProperties.zoom
    );
  }
}

