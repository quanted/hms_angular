import { Injectable } from '@angular/core';

import * as L from 'leaflet';
import * as ESRI from 'esri-leaflet';

@Injectable({
  providedIn: 'root'
})
export class LayerService {
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

  features = [
    { 
      name: 'flowlines',
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/NHDSnapshot_NP21/MapServer/0",
      style: {
        color: '#00FFFF',
        weight: 1,
        fillColor: '#00FFFF',
        fillOpacity: 0
      }
    },
    { 
      name: "catchments",
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/Catchments_NP21_Simplified/MapServer/0",
      style: {
        color: '#008009',
        weight: 1,
        fillColor: '#008009',
        fillOpacity: 0
      }
    },
    { 
      name: 'huc12',
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/0",
      style: {
        color: '#0026FF',
        weight: 1,
        fillColor: '#0026FF',
        fillOpacity: 0
      }
    },
    { 
      name: 'huc10',
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/1",
      style: {
        color: '#4800FF',
        weight: 1,
        fillColor: '#4800FF',
        fillOpacity: 0
      }
    },
    { 
      name: 'huc8',
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/2",
      style: {
        color: '#B200FF',
        weight: 2,
        fillColor: '#B200FF',
        fillOpacity: 0
      }
    },
    { 
      name: 'huc6',
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/3",
      style: {
        color: '#FF00DC',
        weight: 4,
        fillColor: '#FF00DC',
        fillOpacity: 0
      }
    },
    { 
      name: 'huc4',
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/4",
      style: {
        color: '#FF006E',
        weight: 6,
        fillColor: '#FF006E',
        fillOpacity: 0
      }
    },
    { 
      name: 'huc2',
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/5",
      style: {
        color: '#FF0000',
        weight: 8,
        fillColor: '#FF0000',
        fillOpacity: 0
      }
    },
  ]

  basemapLayers = [/* "Map Name": L.tileLayer, */]
  featureLayers = [/* "Marker": ESRI.featureLayer, */];
  
  constructor() { 
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
    for (let feature of this.features) {
      let layer = ESRI.featureLayer({
        url: feature.url,
      });
      layer.setStyle({
        color: feature.style.color,
        weight: feature.style.weight,
        fillColor: feature.style.fillColor,
        fillOpacity: feature.style.fillOpacity,
      });
      this.featureLayers.push({
        type: 'feature',
        name: feature.name,
        layer: layer,
        show: false,
      });
    }
  }

  updateFeatureStyle(featureName, style): void {
    for (let feature of this.featureLayers) {
      if (feature.name == featureName) {
        feature.layer.setStyle(style);
      }
    }
  }

  getBasemapLayers() {
    return this.basemapLayers;
  }

  getFeatureLayers() {
    return this.featureLayers;
  }
}
