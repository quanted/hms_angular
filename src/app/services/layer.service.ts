import { Injectable } from "@angular/core";

import { BehaviorSubject, forkJoin } from "rxjs";

import * as L from "leaflet";
import * as ESRI from "esri-leaflet";

import { HmsService } from "./hms.service";
import { WatersService } from "./waters.service";

@Injectable({
    providedIn: "root",
})
export class LayerService {
    ZOOM_MIN = 4;
    ZOOM_MAX = 16;

    basemaps = [
        {
            name: "ESRI National Geographic",
            layer: L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
                {
                    attribution:
                        "Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC",
                    maxZoom: this.ZOOM_MAX,
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
                    maxZoom: this.ZOOM_MAX,
                }
            ),
        },
        {
            name: "ESRI Topographic",
            layer: L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
                {
                    attribution:
                        "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
                    maxZoom: this.ZOOM_MAX,
                }
            ),
        },
        {
            name: "USGS Imagery",
            layer: L.tileLayer(
                "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
                {
                    attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
                    maxZoom: this.ZOOM_MAX,
                }
            ),
        },
        {
            name: "USGS Topographic",
            layer: L.tileLayer(
                "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
                {
                    attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
                    maxZoom: this.ZOOM_MAX,
                }
            ),
        },
        {
            name: "No Basemap",
            layer: L.tileLayer("", {}),
        },
    ];

    overlays = [
        {
            name: "Flowlines",
            minZoom: 12,
            maxZoom: this.ZOOM_MAX,
            url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/NHDSnapshot_NP21/MapServer/0",
            style: {
                color: "#00FFFF",
                weight: 1,
                fillColor: "#00FFFF",
                fillOpacity: 0,
            },
        },
        {
            name: "Catchments",
            minZoom: 12,
            maxZoom: this.ZOOM_MAX,
            url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/Catchments_NP21_Simplified/MapServer/0",
            style: {
                color: "#008009",
                weight: 1,
                fillColor: "#008009",
                fillOpacity: 0,
            },
        },
        {
            name: "Huc 12",
            minZoom: 10,
            maxZoom: this.ZOOM_MAX,
            url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/0",
            style: {
                color: "#0026FF",
                weight: 1,
                fillColor: "#0026FF",
                fillOpacity: 0,
            },
        },
        {
            name: "Huc 10",
            minZoom: 8,
            maxZoom: this.ZOOM_MAX,
            url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/1",
            style: {
                color: "#4800FF",
                weight: 1,
                fillColor: "#4800FF",
                fillOpacity: 0,
            },
        },
        {
            name: "Huc8",
            minZoom: 6,
            maxZoom: this.ZOOM_MAX,
            url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/2",
            style: {
                color: "#B200FF",
                weight: 2,
                fillColor: "#B200FF",
                fillOpacity: 0,
            },
        },
        {
            name: "Huc 6",
            minZoom: this.ZOOM_MIN,
            maxZoom: this.ZOOM_MAX,
            url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/3",
            style: {
                color: "#FF00DC",
                weight: 4,
                fillColor: "#FF00DC",
                fillOpacity: 0,
            },
        },
        {
            name: "Huc 4",
            minZoom: this.ZOOM_MIN,
            maxZoom: this.ZOOM_MAX,
            url: "https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus_NP21/WBD_NP21_Simplified/MapServer/4",
            style: {
                color: "#FF006E",
                weight: 6,
                fillColor: "#FF006E",
                fillOpacity: 0,
            },
        },
        {
            name: "Huc 2",
            minZoom: this.ZOOM_MIN,
            maxZoom: this.ZOOM_MAX,
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
    overlayLayers = [
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
    hucColor = "#000000";
    catchmentColor = "#000000";
    // stream segment colors
    pourPointColor = "#ADEAEA";
    inNetworkColor = "#63D1F4";
    headwaterColor = "#0198E1";
    boundaryColor = "#FF4200";
    selectedColor = "#FFFF00";
    simInProgressColor = "#FFB01F";
    simCompletedColor = "#00C113";
    simFailColor = "#FF0037";

    segmentLineSize = 3;
    selectedSegmentSize = 4;

    // animated water icon
    splashIcon = L.icon({
        iconUrl: "../../../assets/images/icon_water.png",
        iconSize: [32, 32],
        iconAnchor: [0, 0],
        popupAnchor: [0, 32],
        className: "splash",
    });

    private clickListenerSubject: BehaviorSubject<any>;
    private layerErrorSubject: BehaviorSubject<any>;

    constructor(private hms: HmsService, private waters: WatersService) {
        this.clickListenerSubject = new BehaviorSubject<any>(null);
        this.layerErrorSubject = new BehaviorSubject<any>(null);

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
        for (let feature of this.overlays) {
            let layer = ESRI.featureLayer({
                url: feature.url,
                minZoom: feature.minZoom,
                maxZoom: feature.maxZoom,
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
            this.overlayLayers.push({
                type: "feature",
                name: feature.name,
                layer: layer,
                show: false,
            });
        }
    }

    addToolTip(feature, layer): void {
        // Add comid tooltip to flowlines overlay
        if (feature.properties.COMID) {
            layer.bindTooltip(`comID: ${feature.properties.COMID}`, {
                sticky: true,
            });
        }
        // Add catchment tooltip to catchment overlay
        if (feature.properties.FEATUREID) {
            layer.bindTooltip(`Catchment: ${feature.properties.FEATUREID}`, {
                sticky: true,
            });
        }
        // Add huc tooltip to hucs overlay
        const hucLayerNames = ["HU_12_NAME", "HU_10_NAME", "HU_8_NAME", "HU_6_NAME", "HU_4_NAME", "HU_2_NAME"];
        for (let name of hucLayerNames) {
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
        for (let layer of this.simLayers) {
            if (layer.show) {
                this.map.addLayer(layer.layer);
            }
            if (layer.name == "HUC") {
                this.map.fitBounds(layer.layer.getBounds());
            }
        }
    }

    addFeature(id, feature) {
        let layer;
        try {
            layer = L.geoJSON(feature, {
                interactive: false,
                style: {
                    color: id == "HUC" ? this.hucColor : this.catchmentColor,
                    weight: 2,
                    fillColor: id == "HUC" ? this.hucColor : this.catchmentColor,
                    fillOpacity: 0,
                },
            });
        } catch {
            this.layerErrorSubject.next({ error: `layer service failed to create ${id} layer` });
        }

        if (layer) {
            this.simLayers.push({
                type: "simfeature",
                name: id,
                layer,
                show: true,
            });
            if (this.map) {
                layer.addTo(this.map);
                if (id == "HUC" && this.map.getZoom() < 13) {
                    this.map.fitBounds(layer.getBounds());
                }
            }
        }
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

    removeCatchment(): void {
        this.removeFeature("Catchment");
        this.removeFeature("Pour Point");
        this.removeFeature("Network");
        this.removeFeature("Boundary");
        this.removeFeature("Headwaters");
        this.removeFeature("Monitoring Stations");
        this.selectedComId = null;
        for (let segmentLayer of this.segmentLayers) {
            this.map.removeLayer(segmentLayer.layer);
        }
        this.segmentLayers = [];
    }

    buildStreamLayers(streamData) {
        if (streamData.pourPoint) {
            const pourPointLayer = L.featureGroup().addTo(this.map);
            const pourPoint = streamData.pourPoint;

            const layerStyle = {
                color: this.pourPointColor,
                weight: this.segmentLineSize,
            };

            const segmentLayer = this.createSimLayer(pourPoint, layerStyle);
            this.segmentLayers.push({
                comid: pourPoint.comid,
                layer: segmentLayer,
                name: "pourPoint",
            });
            segmentLayer.addTo(pourPointLayer);

            pourPointLayer["options"]["style"] = {
                color: this.headwaterColor,
                weight: this.segmentLineSize,
            };

            this.simLayers.push({
                type: "simfeature-line",
                name: "Pour Point",
                layer: pourPointLayer,
                show: true,
            });
        }

        if (streamData.inNetwork.length) {
            const inNetworkLayer = L.featureGroup().addTo(this.map);
            const inNetwork = streamData.inNetwork;

            const layerStyle = {
                color: this.inNetworkColor,
                weight: this.segmentLineSize,
            };

            for (let segment of inNetwork) {
                const segmentLayer = this.createSimLayer(segment, layerStyle);
                this.segmentLayers.push({
                    comid: segment.comid,
                    layer: segmentLayer,
                    name: "inNetwork",
                });
                segmentLayer.addTo(inNetworkLayer);
            }
            inNetworkLayer["options"]["style"] = {
                color: this.inNetworkColor,
                weight: this.segmentLineSize,
            };
            this.simLayers.push({
                type: "simfeature-line",
                name: "Network",
                layer: inNetworkLayer,
                show: true,
            });
        }

        if (streamData.headwater.length) {
            const headwaterLayer = L.featureGroup().addTo(this.map);
            const headwater = streamData.headwater;

            const layerStyle = {
                color: this.headwaterColor,
                weight: this.segmentLineSize,
            };

            for (let segment of headwater) {
                const segmentLayer = this.createSimLayer(segment, layerStyle);
                this.segmentLayers.push({
                    comid: segment.comid,
                    layer: segmentLayer,
                    name: "headwater",
                });
                segmentLayer.addTo(headwaterLayer);
            }
            headwaterLayer["options"]["style"] = {
                color: this.headwaterColor,
                weight: this.segmentLineSize,
            };
            this.simLayers.push({
                type: "simfeature-line",
                name: "Headwaters",
                layer: headwaterLayer,
                show: true,
            });
        }

        if (streamData.boundary.length) {
            const boundaryLayer = L.featureGroup().addTo(this.map);
            const boundary = streamData.boundary;

            const layerStyle = {
                color: this.boundaryColor,
                weight: this.segmentLineSize,
            };

            for (let segment of boundary) {
                const segmentLayer = this.createSimLayer(segment, layerStyle);
                this.segmentLayers.push({
                    comid: segment.comid,
                    layer: segmentLayer,
                    name: "boundary",
                });
                segmentLayer.addTo(boundaryLayer);
            }
            boundaryLayer["options"]["style"] = {
                color: this.boundaryColor,
                weight: this.segmentLineSize,
            };
            this.simLayers.push({
                type: "simfeature-line",
                name: "Boundary",
                layer: boundaryLayer,
                show: true,
            });
        }

        if (streamData.eventsEncountered) {
            const stations = streamData.eventsEncountered;
            const stationLayer = L.geoJSON().addTo(this.map);
            for (let i = 0; i < stations.length; i++) {
                const sEvent = stations[i];
                const sFeatureId = sEvent.source_featureid;
                L.marker([sEvent.shape.coordinates[1], sEvent.shape.coordinates[0]], {
                    icon: this.marker,
                })
                    .bindPopup(`Station ID: ${sFeatureId}`)
                    .addTo(stationLayer);
            }
            stationLayer["options"]["style"] = {
                color: this.boundaryColor,
                weight: this.segmentLineSize,
            };
            this.simLayers.push({
                type: "simfeature-line",
                name: "Monitoring Stations",
                layer: stationLayer,
                show: true,
            });
        }
    }

    createSimLayer(segmentData, style): any {
        const simLayer = L.geoJSON(segmentData.shape, {
            style,
        });
        simLayer.on("click", (e) => {
            this.selectSegment(segmentData.comid);
        });
        simLayer.bindTooltip(`comID: ${segmentData.comid}`, {
            sticky: true,
        });
        return simLayer;
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
                for (let feature of this.overlayLayers) {
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
        if (catchment_status) {
            for (let segment of catchment_status) {
                this.updateSegment(segment.comid, segment.status);
            }
        }
    }

    selectSegment(comid): void {
        let found = false;

        for (let layer of this.segmentLayers) {
            let style = {
                color: this.inNetworkColor,
                weight: this.segmentLineSize,
            };

            switch (layer.name) {
                case "inNetwork":
                    style.color = this.inNetworkColor;
                    break;
                case "boundary":
                    style.color = this.boundaryColor;
                    break;
                case "headwater":
                    style.color = this.headwaterColor;
                    break;
                case "pourPoint":
                    style.color = this.pourPointColor;
                    break;
                default:
                    console.log(`ERROR: selectSegment.UNKNOWN_LAYER_NAME ${layer.name}`);
            }

            if (layer.comid == comid) {
                style = {
                    color: this.selectedColor,
                    weight: this.selectedSegmentSize,
                };
                found = true;
            }
            layer.layer.setStyle(style);
        }
        if (found) {
            this.clickListenerSubject.next(comid);
            this.selectedComId = comid;
        }
    }

    updateSegment(comid, status): void {
        // update segment color
        for (let layer of this.segmentLayers) {
            if (layer.comid == comid) {
                if (status == "IN-PROGRESS") {
                    layer.layer.setStyle({
                        color: this.simInProgressColor,
                        weight: this.selectedSegmentSize,
                    });
                }
                if (status == "COMPLETED") {
                    layer.layer.setStyle({
                        color: this.simCompletedColor,
                        weight: this.selectedSegmentSize,
                    });
                }
                if (status == "FAILED") {
                    layer.layer.setStyle({
                        color: this.simFailColor,
                        weight: this.selectedSegmentSize,
                    });
                }
            }
        }
    }

    updateStyle(name, style) {
        for (let feature of this.overlayLayers) {
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
        // for (let layer of this.overlayLayers) {
        //     if (layer.show) this.toggleLayer(layer.type, layer.name);
        // }
        // for (let layer of this.simLayers) {
        //     if (layer.show) this.toggleLayer(layer.type, layer.name);
        // }
        return {
            basemaps: this.basemapLayers,
            overlays: this.overlayLayers,
            simFeatures: this.simLayers,
        };
    }

    clickListener(): BehaviorSubject<any> {
        return this.clickListenerSubject;
    }

    layerErrorListener(): BehaviorSubject<any> {
        return this.layerErrorSubject;
    }

    centerMap(): void {
        let hucLayer = this.simLayers.find((layer) => {
            return layer.name === "HUC";
        });
        this.map.fitBounds(hucLayer.layer.getBounds());
    }
}
