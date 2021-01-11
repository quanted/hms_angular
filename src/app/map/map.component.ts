import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import {Map, MapOptions, tileLayer, latLng, LeafletEvent, circle, polygon, LatLng} from 'leaflet';

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
    baseLayers: {
      'Open Street Map': tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
    }
  };

  private map: Map;
  private zoom: number;

  constructor() {
  }

  ngOnInit(): void {
    // Set options on initialization
    this.options = {
      layers: [tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        opacity: 0.7,
        minZoom: 2,
        maxZoom: 20,
        detectRetina: true,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

