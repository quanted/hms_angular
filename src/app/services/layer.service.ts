import { Injectable } from "@angular/core";

import * as L from "leaflet";
import * as ESRI from "esri-leaflet";

import { SimulationService } from "./simulation.service";

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

  marker = L.icon({
    iconUrl: "../assets/images/marker-icon.png",
    iconRetinaUrl: "../assets/images/marker-icon-2x.png",
    shadowUrl: "../assets/images/marker-shadow.png",
    iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
  });

  basemapLayers = [
    /* "Map Name": L.tileLayer, */
  ];
  featureLayers = [
    /* "Marker": ESRI.featureLayer, */
  ];
  simLayers = [
    /* "Pour Point": L.layer, */
  ];
  segmentLayers = [
    /*  {
          comid: comid,
          layer: layer, 
        } */
  ];

  selectedComId = null;

  map;
  defaultBasemap = "Open Street Map";

  startColor = "#FF0000";
  inHucColor = "#00F0F0";
  outHucColor = "#FF00FF";
  selectedColor = "#0000FF";
  simCompletedColor = "#00FF00";

  constructor(private simulation: SimulationService) {
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
        onEachFeature: this.addToolTip,
      });
      layer.on("mouseover", (d) => {
        d.layer.setStyle({
          color: feature.style.color,
          weight: feature.style.weight,
          fillColor: "#00FF00",
          fillOpacity: 0,
        });
      });
      layer.on("mouseout", (d) => {
        d.layer.setStyle(feature.style);
      });
      layer.setStyle(feature.style);
      this.featureLayers.push({
        type: "feature",
        name: feature.name,
        layer: layer,
        show: false,
      });
    }
  }

  addToolTip(feature, layer): void {
    const layerNames = [
      "HU_12_NAME",
      "HU_10_NAME",
      "HU_8_NAME",
      "HU_6_NAME",
      "HU_4_NAME",
      "HU_2_NAME",
    ];
    for (let name of layerNames) {
      if (feature.properties[name]) {
        layer.bindTooltip(feature.properties[name], {
          sticky: true,
        });
        break;
      }
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

  addFeature(id, feature) {
    const newFeature = L.geoJSON(feature, {
      interactive: false,
      style: {
        color: "#0000ff",
        weight: 2,
        fillColor: "#0000ff",
        fillOpacity: 0,
      },
    }).addTo(this.map);
    this.simLayers.push({
      type: "simfeature",
      name: id,
      layer: newFeature,
      show: true,
    });
  }

  removeFeature(id) {
    for (let feature of this.simLayers) {
      if (feature.name == id) {
        this.simLayers.splice(this.simLayers.indexOf(feature), 1);
        this.map.removeLayer(feature.layer);
      }
    }
  }

  removeStream(): void {
    this.removeFeature("Pour Point");
    this.removeFeature("Network");
    this.removeFeature("Boundry");
    this.removeFeature("Stations");
    this.selectSegment = null;
  }

  buildStreamLayers(data) {
    const fl = data.output.flowlines_traversed;
    const inHucSegments = [];
    const outHucSegments = [];
    const selectedHuc = this.simulation.getSimData()["huc"].id;

    for (let i in fl) {
      let tmp_feature = L.geoJSON(fl[i].shape, {
        style: {
          color: this.inHucColor,
          weight: 2,
        },
      });
      tmp_feature.on("click", (e) => {
        this.selectSegment(fl[i].comid);
      });
      tmp_feature.bindTooltip(`comID: ${fl[i].comid}`, {
        sticky: true,
      });

      const selectedLayerProps = {
        comid: fl[i].comid,
        name: "in-huc-segment",
        layer: tmp_feature,
      };

      if (selectedHuc == fl[i].wbd_huc12) {
        inHucSegments.push(tmp_feature);
      } else {
        tmp_feature.setStyle({
          color: this.outHucColor,
          weight: 2,
        });
        selectedLayerProps.name = "out-huc-segment";
        outHucSegments.push(tmp_feature);
        this.simulation.updateSegmentList("boundary", fl[i].comid);
      }

      // first segment is pour point, add it as layer
      if (i == "0") {
        tmp_feature.setStyle({
          color: this.startColor,
          weight: 2,
        });
        this.simLayers.push({
          type: "simfeature-line",
          name: "Pour Point",
          layer: tmp_feature,
          show: true,
        });
        selectedLayerProps.name = "pour-point";
      }
      this.segmentLayers.push(selectedLayerProps);
    }

    if (inHucSegments.length) {
      const streamLayer = L.featureGroup(inHucSegments).addTo(this.map);
      streamLayer["options"]["style"] = {
        color: this.inHucColor,
        weight: 2,
      };
      this.simLayers.push({
        type: "simfeature-line",
        name: "Network",
        layer: streamLayer,
        show: true,
      });
    }

    if (outHucSegments.length) {
      const boundryLayer = L.featureGroup(outHucSegments).addTo(this.map);
      boundryLayer["options"]["style"] = {
        color: this.outHucColor,
        weight: 2,
      };
      this.simLayers.push({
        type: "simfeature-line",
        name: "Boundry",
        layer: boundryLayer,
        show: true,
      });
    }

    // build station layer
    const stations = data.output.events_encountered;
    if (stations) {
      const stationLayer = L.geoJSON().addTo(this.map);
      for (let i = 0; i < stations.length; i++) {
        const sEvent = stations[i];
        const sFeatureId = sEvent.source_featureid;
        L.marker([sEvent.shape.coordinates[1], sEvent.shape.coordinates[0]], {
          icon: this.marker,
        })
          .bindPopup(sFeatureId)
          .addTo(stationLayer);
      }
      stationLayer["options"]["style"] = {
        color: this.outHucColor,
        weight: 2,
        fillColor: this.outHucColor,
        fillOpacity: 1,
      };
      this.simLayers.push({
        type: "simfeature",
        name: "Stations",
        layer: stationLayer,
        show: true,
      });
    }
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
      case "simfeature":
      case "simfeature-line":
        for (let feature of this.simLayers) {
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

  selectSegment(comid): void {
    for (let layer of this.segmentLayers) {
      if (layer.comid === this.selectedComId) {
        switch (layer.name) {
          case "in-huc-segment":
            layer.layer.setStyle({
              color: this.inHucColor,
              weight: 2,
            });
            break;
          case "out-huc-segment":
            layer.layer.setStyle({
              color: this.outHucColor,
              weight: 2,
            });
            break;
          case "pour-point":
            layer.layer.setStyle({
              color: this.startColor,
              weight: 2,
            });
            break;
          default:
            console.log(
              `ERROR: selectSegment.UNKNOWN_LAYER_NAME ${layer.name}`
            );
        }
      }
      if (layer.comid == comid) {
        layer.layer.setStyle({
          color: this.selectedColor,
          weight: 4,
        });
      }
    }
    this.selectedComId = comid;
    this.simulation.selectComId(comid);
  }

  updateStyle(name, style) {
    for (let feature of this.featureLayers) {
      if (feature.name == name) {
        feature.layer.setStyle(style);
      }
    }
    for (let feature of this.simLayers) {
      if (feature.name == name) {
        feature.layer.setStyle(style);
      }
    }
  }

  getLayers() {
    return {
      basemaps: this.basemapLayers,
      defaultFeatures: this.featureLayers,
      simFeatures: this.simLayers,
    };
  }
}
