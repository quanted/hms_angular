import { Injectable } from "@angular/core";

import { BehaviorSubject } from "rxjs";

import * as L from "leaflet";
import * as ESRI from "esri-leaflet";

import { SimulationService } from "./simulation.service";

@Injectable({
  providedIn: "root",
})
export class LayerService {
  basemaps = [
    {
      name: "ESRI National Geographic",
      layer: L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC",
          maxZoom: 16,
        }
      ),
    },
    {
      name: "ESRI Imagery",
      layer: L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        }
      ),
    },
    {
      name: "ESRI Topo",
      layer: L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
        }
      ),
    },
    {
      name: "USGS Imagery",
      layer: L.tileLayer(
        "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 20,
          attribution:
            'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
        }
      ),
    },
    {
      name: "USGS Topo",
      layer: L.tileLayer(
        "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 20,
          attribution:
            'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
        }
      ),
    },
    {
      name: "No Basemap",
      layer: L.tileLayer("", {}),
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
  defaultBasemap = "ESRI National Geographic";

  // selection colors
  hucColor = "#00FF00";
  catchmentColor = "#00FF00";
  // stream segment colors
  pourColor = "#FF0000";
  inHucColor = "#0000FF";
  outHucColor = "#FF00FF";
  selectedColor = "#FFFF00";
  simInProgressColor = "#47C7FF";
  simCompletedColor = "#00C113";
  simFailColor = "#FF0037";

  // animated water icon
  splashIcon = L.icon({
    iconUrl: "../../../assets/images/icon_water.png",
    iconSize: [32, 32],
    iconAnchor: [0, 0],
    popupAnchor: [0, 32],
    className: "splash",
  });

  // this isn't doing anything yet
  layerDataSubject: BehaviorSubject<any>;

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
    // this.layerDataSubject = new BehaviorSubject(this.layerData);
    this.simulation.interfaceData().subscribe((d) => {
      if (d.sim_status.catchment_status.length) {
        this.updateStreamLayer(d.sim_status.catchment_status);
      }
    });
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
          open: true,
          icon: this.splashIcon,
        });
        break;
      }
    }
  }

  setupLayers(map) {
    this.map = map;
    for (let layer of this.basemapLayers) {
      if (layer.name == this.defaultBasemap) {
        layer.show = true;
        this.toggleLayer("basemap", layer.name);
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

  removeHuc(): void {
    this.removeFeature("HUC");
  }

  removeStream(): void {
    this.removeFeature("Catchment");
    this.removeFeature("Pour Point");
    this.removeFeature("Network");
    this.removeFeature("Boundry");
    this.removeFeature("Stations");
    this.selectedComId = null;
    for (let segmentLayer of this.segmentLayers) {
      this.map.removeLayer(segmentLayer.layer);
    }
    this.segmentLayers = [];
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
          color: this.pourColor,
          weight: 2,
        });
        this.simLayers.push({
          type: "simfeature-line",
          name: "Pour Point",
          layer: tmp_feature,
          inSim: false, // has the user added this segment/added loadings to segment
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

  updateStreamLayer(catchment_status): void {
    for (let segment of catchment_status) {
      this.updateSegment(segment.comid, segment.status);
    }
  }

  selectSegment(comid): void {
    let found = false;
    for (let layer of this.segmentLayers) {
      if (layer.comid === this.selectedComId) {
        switch (layer.name) {
          case "in-huc-segment":
            layer.layer.setStyle({
              color: (layer.inSim = true
                ? this.selectedColor
                : this.inHucColor),
              weight: 2,
            });
            break;
          case "out-huc-segment":
            layer.layer.setStyle({
              color: (layer.inSim = true
                ? this.selectedColor
                : this.outHucColor),
              weight: 2,
            });
            break;
          case "pour-point":
            layer.layer.setStyle({
              color: (layer.inSim = true ? this.selectedColor : this.pourColor),
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
        layer.inSim = true;
        layer.layer.setStyle({
          color: this.selectedColor,
          weight: 4,
        });
        found = true;
      }
    }
    if (found) {
      this.selectedComId = comid;
      this.simulation.selectComId(comid);
    }
  }

  updateSegment(comid, status): void {
    // update segment color
    for (let layer of this.segmentLayers) {
      if (layer.comid == comid) {
        if (status == "IN-PROGRESS") {
          layer.layer.setStyle({
            color: this.simInProgressColor,
            weight: 3,
          });
        }
        if (status == "COMPLETED") {
          layer.layer.setStyle({
            color: this.simCompletedColor,
            weight: 3,
          });
        }
        if (status == "FAILED") {
          layer.layer.setStyle({
            color: this.simFailColor,
            weight: 3,
          });
        }
      }
    }
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
    for (let layer of this.basemapLayers) {
      if (layer.show) this.toggleLayer(layer.type, layer.name);
    }
    for (let layer of this.featureLayers) {
      if (layer.show) this.toggleLayer(layer.type, layer.name);
    }
    for (let layer of this.simLayers) {
      if (layer.show) this.toggleLayer(layer.type, layer.name);
    }
    return {
      basemaps: this.basemapLayers,
      defaultFeatures: this.featureLayers,
      simFeatures: this.simLayers,
    };
  }
}
