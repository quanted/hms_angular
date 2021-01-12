import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import {Map, MapOptions, tileLayer, latLng, LeafletEvent, circle, polygon, LatLng, GeoJSON} from 'leaflet';
import * as esri from 'esri-leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  @Output() mapEvent: EventEmitter<Map> = new EventEmitter();
  @Output() zoomEvent: EventEmitter<number> = new EventEmitter();
  @Input() options: MapOptions;
  @Input() layersControl = {
    overlays: {
      'Watershed Boundary Line': esri.featureLayer({url: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/0'}),
      HUC2: esri.featureLayer({url: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/1'}),
      HUC4: esri.featureLayer({url: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/2'}),
      HUC6: esri.featureLayer({url: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/3'}),
      HUC8: esri.featureLayer({url: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/4'}),
      HUC10: esri.featureLayer({url: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/5'}),
      HUC12: esri.featureLayer({url: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/6'}),
      HUC14: esri.featureLayer({url: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/7'})
    }
  };

  private map: Map;
  private zoom: number;

  constructor() {
  }

  ngOnInit(): void {
    // Set options on initialization
    this.options = {
      layers: [esri.basemapLayer('Streets', {
        opacity: 0.7,
        minZoom: 2,
        maxZoom: 20,
        detectRetina: true,
        attribution: ''
      })],
      zoom: 4,
      center: new LatLng(39.8283, -98.5795)
    };
  }

  ngOnDestroy(): void {
    this.map.clearAllEventListeners();
    this.map.remove();
  }

  onMapReady(map: Map): void {
    this.map = map;
    this.mapEvent.emit(map);
    this.zoom = map.getZoom();
    this.zoomEvent.emit(this.zoom);
  }

  onMapZoomEnd(e: LeafletEvent): void {
    this.zoom = e.target.getZoom();
    this.zoomEvent.emit(this.zoom);
  }
}

