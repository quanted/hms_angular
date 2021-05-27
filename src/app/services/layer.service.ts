import { Injectable } from "@angular/core";

import * as L from "leaflet";
import * as ESRI from "esri-leaflet";

@Injectable({
  providedIn: "root",
})
export class LayerService {
  basemaps = [
    {
      name: "Open Street Map",
      layer: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }),
    },
    {
      name: "Open Topo Map",
      layer: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      }),
    },
    {
      name: "No basemap",
      layer: L.tileLayer("", {
        attribution:
          '(<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      }),
    },
  ];

  features = [
    {
      name: "flowlines",
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/NHDSnapshot_NP21/MapServer/0",
      style: {
        color: "#00FFFF",
        weight: 1,
        fillColor: "#00FFFF",
        fillOpacity: 0,
      },
    },
    {
      name: "catchments",
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/Catchments_NP21_Simplified/MapServer/0",
      style: {
        color: "#008009",
        weight: 1,
        fillColor: "#008009",
        fillOpacity: 0,
      },
    },
    {
      name: "huc12",
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/0",
      style: {
        color: "#0026FF",
        weight: 1,
        fillColor: "#0026FF",
        fillOpacity: 0,
      },
    },
    {
      name: "huc10",
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/1",
      style: {
        color: "#4800FF",
        weight: 1,
        fillColor: "#4800FF",
        fillOpacity: 0,
      },
    },
    {
      name: "huc8",
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/2",
      style: {
        color: "#B200FF",
        weight: 2,
        fillColor: "#B200FF",
        fillOpacity: 0,
      },
    },
    {
      name: "huc6",
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/3",
      style: {
        color: "#FF00DC",
        weight: 4,
        fillColor: "#FF00DC",
        fillOpacity: 0,
      },
    },
    {
      name: "huc4",
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/4",
      style: {
        color: "#FF006E",
        weight: 6,
        fillColor: "#FF006E",
        fillOpacity: 0,
      },
    },
    {
      name: "huc2",
      url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/5",
      style: {
        color: "#FF0000",
        weight: 8,
        fillColor: "#FF0000",
        fillOpacity: 0,
      },
    },
  ];

  basemapLayers = [
    /* "Map Name": L.tileLayer, */
  ];
  featureLayers = [
    /* "Marker": ESRI.featureLayer, */
  ];

  map;
  defaultBasemap = "Open Street Map";

  hoverLayer: L.GeoJSON = null;
  hucLayer: L.GeoJSON = null;
  catchmentLayer: L.GeoJSON = null;
  snapline: L.GeoJSON = null;
  streamLayer: L.GeoJSON = null;
  searchStartStream: L.GeoJSON = null;
  stationLayer: L.GeoJSON = null;

  constructor() {
    // setup default tile maps
    for (let basemap of this.basemaps) {
      this.basemapLayers.push({
        type: "basemap",
        name: basemap.name,
        layer: basemap.layer,
        show: false,
      });
    }
    // setup default feature layers
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
        type: "feature",
        name: feature.name,
        layer: layer,
        show: false,
      });
    }
  }

  setupLayers(map) {
    this.map = map;
    for (let layer of this.basemapLayers) {
      if (layer.name == this.defaultBasemap) {
        map.addLayer(layer.layer);
        layer.show = true;
      }
    }
  }

  addFeature(feature): void {
    console.log("addFeature: ", feature);
    if (this.featureLayers[feature]) {
      this.map.removeLayer(this.featureLayers[feature]);
    }
    const newFeature = L.geoJSON(feature.features[0].geometry, {
      style: {
        color: "#0000ff",
        weight: 2,
        fillColor: "#0000ff",
        fillOpacity: 0.25,
      },
    });
    newFeature
      .bindTooltip(
        `HUC: ${feature.features[0].properties.HUC_12}
      ${feature.features[0].properties.HU_12_NAME}`
      )
      .setZIndex(3)
      .addTo(this.map);
    this.featureLayers.push({
      type: "feature",
      name: feature.features[0].properties.HU_12_NAME,
      layer: newFeature,
      show: true,
    });
  }

  buildStreamLayer(data) {
    // let fl = data.output.flowlines_traversed;
    // let startColor = "#FF0000";

    // this.searchStartStream = L.geoJSON(fl[0].shape, {
    //   style: {
    //     color: startColor,
    //     weight: 4,
    //   },
    // })
    //   .bindTooltip(`comID: ${fl[0].comid}`)
    //   .setZIndex(1)
    //   .addTo(map);

    // this.streamLayer = L.geoJSON().addTo(map);
    // for (let i in fl) {
    //   let streamColor = "#00F0F0";
    //   let tmp_feature = L.geoJSON(fl[i].shape).bindTooltip(
    //     `comID: ${fl[i].comid}`
    //   );

    //   // Add click event listener to each stream layer for
    //   // displaying comid select input UI.
    //   tmp_feature.on("click", () => {
    //     // this.selectedComid = fl[i].comid;
    //     // this.comidClicked = !this.comidClicked;
    //   });

    //   if (this.hucSelected.HUC_12 === fl[i].wbd_huc12) {
    //     streamColor = "#00F0F0";
    //   } else {
    //     streamColor = "#FF00FF";
    //   }
    //   tmp_feature.setStyle({
    //     color: streamColor,
    //     weight: 4,
    //   });
    //   this.streamLayer.addLayer(tmp_feature).setZIndex(2);
    // }

    // build station layer
    this.stationLayer = L.geoJSON().addTo(this.map);
    const stations = data.output.events_encountered;
    if (stations) {
      for (let i = 0; i < stations.length; i++) {
        const sEvent = stations[i];
        const sFeatureId = sEvent.source_featureid;
        const sProgram = sEvent.source_program;
        // console.log("event: ", sEvent);
        L.marker([sEvent.shape.coordinates[1], sEvent.shape.coordinates[0]])
          .bindPopup(sFeatureId)
          .addTo(this.stationLayer);
      }
    }

    // Bring search start segment to front
    this.searchStartStream.bringToFront();

    // centers map on result - TODO: except it doesn't sometimes
    // this.map.fitBounds(this.streamLayer.getBounds(), {
    //   maxZoom: 13,
    // });
  }

  toggleLayer(type, name): void {
    switch (type) {
      case "basemap":
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
      case "feature":
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
        console.log("UNKNOWN MAP_LAYER_TYPE: ", type);
    }
  }

  updateStyle(name, style) {
    for (let feature of this.featureLayers) {
      if (feature.name == name) {
        feature.layer.setStyle(style);
      }
    }
  }

  getLayers() {
    return {
      basemaps: this.basemapLayers,
      features: this.featureLayers,
    };
  }
}
