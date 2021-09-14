import { Injectable } from "@angular/core";
import { formatDate } from "@angular/common";

import { BehaviorSubject, forkJoin, Observable } from "rxjs";

import { CookieService } from "ngx-cookie-service";

import { HmsService } from "./hms.service";
import { WatersService } from "./waters.service";

import { DefaultSimData } from "../models/DefaultSimData";
import { LayerService } from "./layer.service";
import { timeThursdays } from "d3-time";
import { last } from "rxjs/operators";

@Injectable({
    providedIn: "root",
})
export class SimulationService {
    private simData = { ...DefaultSimData.defaultSimData };
    private simDataSubject: BehaviorSubject<any>;

    STATUS_CHECK_INTERVAL = 1000; // 1000 = 1 second interval
    statusCheck: ReturnType<typeof setInterval>; // interval that checks with backend and updates sim status

    constructor(
        private hms: HmsService,
        private waters: WatersService,
        private layerService: LayerService,
        private cookieService: CookieService
    ) {
        this.simDataSubject = new BehaviorSubject(this.simData);

        this.layerService.clickListener().subscribe((comid) => {
            this.updateSimData("selectedComId", comid);
        });

        if (this.cookieService.check("sim_setup")) {
            this.rebuildSimData();
        }
    }

    // returns a Subject for interface components to subscribe to
    interfaceData(): BehaviorSubject<any> {
        return this.simDataSubject;
    }

    getDefaultFirstDay(): string {
        return formatDate(new Date(DefaultSimData.defaultSimData.PSetup.firstDay), "yyy-MM-dd", "en");
    }

    getDefaultLastDay(): string {
        return formatDate(new Date(DefaultSimData.defaultSimData.PSetup.lastDay), "yyy-MM-dd", "en");
    }

    getDefaultUpstreamDistance(): string {
        return "50";
    }

    getDefaultTimeStep(): string {
        return "hour";
    }

    getPourPoint(): string {
        return this.simData.network.pour_point_comid;
    }

    getSelectedHuc(): string {
        return this.simData.selectedHuc;
    }

    isHucSelected(): boolean {
        return this.simData.selectedHuc ? true : false;
    }

    isCatchmentSelected(): boolean {
        return this.simData.selectedCatchment ? true : false;
    }

    getBaseJsonByFlags(flags: any): void {
        this.updateSimData("waiting", true);
        this.hms.getBaseJsonByFlags(flags).subscribe((json) => {
            this.simData.json_flags = flags;
            this.simData.base_json = json;
            this.updateState("json_flags", flags);
            const sv = [];
            for (let key of Object.keys(json.AQTSeg.SV)) {
                sv.push(json.AQTSeg.SV[key]);
            }
            this.simData.sv = sv;
            this.updateSimData("waiting", false);
        });
    }

    executeSimulation(pSetup): void {
        this.updateSimData("sim_executing", true);
        this.initializeAquatoxSimulation(pSetup).subscribe((response) => {
            this.updateSimData("simId", response["_id"]);
            this.updateState("simId", response["_id"]);

            this.addCatchmentDependencies().subscribe((response) => {
                this.hms.executeAquatoxSimulation(this.simData["simId"]).subscribe((response) => {
                    if (!response.error) {
                        this.startStatusCheck();
                    }
                });
            });
        });
    }

    initializeAquatoxSimulation(pSetup): Observable<any> {
        this.updateSimData("sim_completed", false);

        this.simData.PSetup.firstDay = pSetup.firstDay;
        this.simData.PSetup.lastDay = pSetup.lastDay;

        this.simData.base_json.AQTSeg.PSetup.FirstDay.Val = formatDate(pSetup.firstDay, "yyyy-MM-ddTHH:mm:ss", "en");
        this.simData.base_json.AQTSeg.PSetup.LastDay.Val = formatDate(pSetup.lastDay, "yyyy-MM-ddTHH:mm:ss", "en");

        this.simData.base_json.AQTSeg.PSetup.StepSizeInDays.Val = pSetup.tStep == "day" ? true : false;

        const initData = {
            comid_input: {
                comid: this.simData.network.pour_point_comid.toString(),
                input: this.simData.base_json,
            },
            network: {
                order: this.simData.network.order,
                sources: this.simData.network.sources,
            },
            simulation_dependencies: [],
            catchment_dependencies: [],
        };
        return this.hms.addAquatoxSimData(initData);
    }

    addCatchmentDependencies(): Observable<any> {
        const dependencyRequests = [];
        for (let comid of Object.keys(this.simData.network.sources)) {
            dependencyRequests.push(this.addCatchmentDependency(comid));
        }
        return forkJoin(dependencyRequests);
    }

    addCatchmentDependency(comid): Observable<any> {
        const dependency = {
            sim_id: this.simData["simId"],
            comid_input: {
                comid: comid.toString(),
                input: this.simData.base_json,
            },
            catchment_dependencies: [
                {
                    name: "streamflow",
                    url: "api/hydrology/streamflow/",
                    input: {
                        source: "nwm",
                        dateTimeSpan: {
                            startDate: formatDate(this.simData.PSetup.firstDay, "yyyy-MM-ddTHH:mm:ss", "en"),
                            endDate: formatDate(this.simData.PSetup.lastDay, "yyyy-MM-ddTHH:mm:ss", "en"),
                        },
                        geometry: {
                            comID: comid.toString(),
                        },
                        temporalResolution: "hourly",
                        timeLocalized: "false",
                    },
                },
            ],
        };
        return this.hms.addAquatoxSimData(dependency);
    }

    cancelAquatoxSimulationExecution(): void {
        this.hms.cancelAquatoxSimulationExecution(this.simData["simId"]).subscribe((response) => {
            this.updateSimData("sim_completed", true);
            this.endStatusCheck();
        });
    }

    startStatusCheck(): void {
        if (this.simData.simId) {
            this.statusCheck = setInterval(() => {
                this.hms.getAquatoxSimStatus(this.simData.simId).subscribe((simStatus) => {
                    if (simStatus.catchments) {
                        for (let comid of Object.keys(simStatus.catchments)) {
                            if (simStatus.catchments[comid].status == "COMPLETED") {
                                this.addSimResults(comid, simStatus.catchments[comid].task_id);
                            }
                        }
                        if (
                            !this.simData.sim_completed &&
                            (simStatus.status == "COMPLETED" || simStatus.status == "FAILED")
                        ) {
                            this.updateSimData("sim_completed", true);
                            this.updateSimData("sim_executing", false);
                            this.endStatusCheck();
                        }
                        const segmentStatusList = [];
                        for (let segment of Object.keys(simStatus.catchments)) {
                            segmentStatusList.push({
                                comid: segment,
                                ...simStatus.catchments[segment],
                            });
                        }
                        simStatus.catchments = segmentStatusList;
                        this.updateSimData("sim_status", simStatus);
                        this.layerService.updateStreamLayer(simStatus.catchments);
                    }
                });
            }, this.STATUS_CHECK_INTERVAL);
        } else {
            this.updateSimData("status_message", "No simId for this simulation");
        }
    }

    addSimResults(comid, taskId): void {
        if (!this.simData.network.catchment_data[comid]) {
            this.hms.getCatchmentData(taskId).subscribe((catchmentData) => {
                this.simData.network.catchment_data[comid] = catchmentData;
                this.updateSimData();
            });
        }
    }

    endStatusCheck(): void {
        clearInterval(this.statusCheck);
    }

    getStatus(): void {
        this.hms.getAquatoxSimStatus(this.simData["simId"]).subscribe((response) => {
            let status = response.status;
            if (!status) status = response.error;
        });
    }

    downloadSimResults(): void {
        this.hms.downloadAquatoxSimResults(this.simData["simId"]).subscribe((data) => {
            const blob = new Blob([data], {
                type: "application/zip",
            });
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_self");
        });
    }

    selectComId(comid): void {
        this.updateSimData("selectedComId", comid);
    }

    getCatchmentByComId(comid): void {
        // get catchment info
        this.updateSimData("waiting", true);
        this.hms.getCatchmentInfo(comid).subscribe(
            (data) => {
                if (data.catchmentInfo?.metadata) {
                    this.simData.network.pour_point_comid = comid;
                    this.updateState("pour_point_comid", comid);
                    // now get the huc by coods
                    const coords = {
                        lat: data.catchmentInfo.metadata.CentroidLatitude,
                        lng: data.catchmentInfo.metadata.CentroidLongitude,
                    };
                    this.getHuc(coords);
                    this.getCatchment(coords);
                }
            },
            (error) => {
                console.log("error getting catchment data: ", error);
            }
        );
    }

    getHuc(coords): void {
        this.updateSimData("waiting", true);
        this.waters.getHucData("HUC_12", coords.lat, coords.lng).subscribe(
            (data) => {
                if (data) {
                    this.layerService.addFeature("HUC", data);
                    this.updateSimData("selectedHuc", data);
                    this.updateState("huc", coords);
                }
                this.updateSimData("waiting", false);
            },
            (error) => {
                console.log("error getting huc data: ", error);
            }
        );
    }

    getCatchment(coords): void {
        this.updateSimData("waiting", true);
        this.waters.getCatchmentData(coords.lat, coords.lng).subscribe(
            (data) => {
                if (data) {
                    this.layerService.addFeature("Catchment", data);
                    this.updateSimData("selectedCatchment", data);
                    this.updateState("pour_point_comid", data.features[0].properties.FEATUREID);
                }
                this.updateSimData("waiting", false);
            },
            (error) => {
                console.log("error getting catchment data: ", error);
            }
        );
    }

    buildStreamNetwork(comid: string, distance: string): void {
        this.updateSimData("waiting", true);
        forkJoin([this.waters.getNetworkGeometry(comid, distance), this.hms.getNetworkInfo(comid, distance)]).subscribe(
            (networkData) => {
                if (networkData[0].error || networkData[1].error) {
                    console.log("error: ", networkData[0].error);
                    console.log("error: ", networkData[1].error);
                } else {
                    let geom = null;
                    let info = null;
                    for (let data of networkData) {
                        if (data.networkInfo) info = data.networkInfo;
                        if (data.networkGeometry) geom = data.networkGeometry;
                    }
                    if (geom && info) {
                        console.log("info: ", info);
                        this.updateState("upstream_distance", distance);
                        this.prepareNetworkGeometry(geom, info);
                    }
                }
                this.updateSimData("waiting", false);
            },
            (error) => {
                console.log("forkJoin error: ", error);
            }
        );
    }

    prepareNetworkGeometry(data, info): void {
        const selectedHuc = this.simData.selectedHuc.properties.HUC_12;
        const pourPointComid = data.output.resolved_starts[0].comid;
        const flowlines = data.output.flowlines_traversed;

        // order and sources need to be filtered down to just in huc and boundary segments
        // order and sources goes to the backend
        this.simData.network.order = info.order;
        this.simData.network.sources = info.sources;
        this.simData.network.network = info.network;

        const segments = {
            pourPoint: null,
            boundary: [],
            headwater: [],
            inNetwork: [],
            eventsEncountered: data.output.events_encountered,
        };

        for (let segment of flowlines) {
            if (segment.comid === pourPointComid) {
                segments.pourPoint = segment;
                // if it's in network and
                // if it doesn't have any sources it's a headwater
            } else if (segment.wbd_huc12 == selectedHuc && !info.sources[segment.comid].length) {
                segments.headwater.push(segment);
                // else if it's in the aoi huc
            } else if (segment.wbd_huc12 == selectedHuc) {
                segments.inNetwork.push(segment);
            } else {
                // loop through the inNetwork segments and see if this comid is a source
                // if so add it to the boundary segments
                for (let inNetworkSegment of segments.inNetwork) {
                    if (info.sources[inNetworkSegment.comid].includes(segment.comid.toString())) {
                        segments.boundary.push(segment);
                    }
                }
            }
        }
        this.simData.network.segments.pourPoint = segments.pourPoint;
        this.simData.network.segments.boundary = segments.boundary;
        this.simData.network.segments.headwater = segments.headwater;
        this.simData.network.segments.inNetwork = segments.inNetwork;
        this.simData.network.segments.totalNumSegments = [
            segments.pourPoint,
            ...segments.boundary,
            ...segments.inNetwork,
            ...segments.headwater,
        ].length;
        this.layerService.buildStreamLayers(segments);
    }

    clearHuc(): void {
        this.updateSimData("selectedHuc", null);
        this.updateState("huc", null);
        this.clearCatchment();
        this.layerService.removeHuc();
    }

    clearCatchment(): void {
        this.simData.network.segments.boundary = [];
        this.simData.network.segments.headwater = [];
        this.simData.network.segments.inNetwork = [];
        this.simData.network.segments.pourPoint = null;
        this.simData.network.segments.totalNumSegments = null;
        this.simData.network.sources = null;
        this.simData.network.order = null;
        this.simData.network.network = null;
        this.simData.network.catchment_data = {};
        this.simData.selectedComId = null;
        this.updateSimData("selectedCatchment", null);
        this.updateState("pour_point_comid", null);
        this.updateState("upstream_distance", null);
        this.layerService.removeCatchment();
    }

    updateSimData(key?, data?): void {
        if (key && data) {
            if (key == "selectedHuc") {
                const newSimData = {
                    name: data.features[0].properties.HU_12_NAME,
                    ...data.features[0],
                };
                this.simData.selectedHuc = newSimData;
            }
            if (key == "selectedCatchment") {
                const newSimData = {
                    comid: data.features[0].properties.FEATUREID,
                    ...data.features[0],
                };
                this.simData.selectedCatchment = newSimData;
                this.simData.network.pour_point_comid = newSimData.properties.FEATUREID;
            } else if (key == "network") {
                this.simData.network.network = data.network;
                this.simData.network.order = data.order;
                const sources = {};
                for (let key of Object.keys(data.sources)) {
                    if (key != "boundaries") {
                        sources[key] = data.sources[key];
                    }
                }
                this.simData.network.sources = sources;
            } else if (key == "base_json") {
                this.simData.Location.Locale = data.AQTSeg.Location.Locale;
                this.simData.Location.Remin = data.AQTSeg.Location.Remin;
                this.simData.base_json = data;
            } else if (key == "sv") {
                this.simData[key] = data;
            } else if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
                this.simData[key] = data;
            } else {
                this.simData[key] = { ...this.simData[key], ...data };
            }
        } else if (key && !data) {
            this.simData[key] = null;
        }
        this.simDataSubject.next(this.simData);
        console.log("simData: ", this.simData);
    }

    getDefaultCatchmentDependencies() {
        return {
            name: "streamflow",
            url: "api/hydrology/streamflow/",
            input: {
                source: "nwm",
                dateTimeSpan: {
                    startDate: "2000-01-01T00:00:00",
                    endDate: "2000-12-31T00:00:00",
                },
                geometry: {
                    comID: this.simData.network.pour_point_comid.toString(),
                },
                temporalResolution: "hourly",
                timeLocalized: "false",
            },
        };
    }

    updateSegmentLoadings(comid, loading): void {
        if (!this.simData.network.catchment_loadings[comid]) {
            this.simData.network.catchment_loadings[comid] = [];
        }
        this.simData.network.catchment_loadings[comid].push(loading);
        this.updateSimData();
    }

    rebuildSimData(): void {
        /** stuff needed to rebuild sim state
         *  simState: {
         *      pour_point_comid,
         *      upstream_distance,
         *      json_flags,
         *      simId,
         *  }
         */
        const lastState = this.getState();
        if (lastState) {
            if (lastState.upstream_distance) {
                this.rebuildStreamNetwork(lastState.pour_point_comid, lastState.upstream_distance);
            } else if (lastState.pour_point_comid) {
                this.simData.network.pour_point_comid = lastState.pour_point_comid;
                this.getCatchmentByComId(lastState.pour_point_comid);
            } else if (lastState.huc) {
                this.getHuc(lastState.huc);
            }
            if (lastState.simId) {
                this.simData.network.pour_point_comid = lastState.pour_point_comid;
                this.simData.simId = lastState.simId;
                this.startStatusCheck();
            }
            if (lastState.json_flags) {
                this.simData.json_flags = lastState.json_flags;
            }
        }
    }

    rebuildStreamNetwork(comid, distance): void {
        this.updateSimData("waiting", true);
        this.hms.getCatchmentInfo(comid).subscribe(
            (data) => {
                if (data.catchmentInfo?.metadata) {
                    this.simData.network.pour_point_comid = comid;
                    // now get the huc by coods
                    const coords = {
                        lat: data.catchmentInfo.metadata.CentroidLatitude,
                        lng: data.catchmentInfo.metadata.CentroidLongitude,
                    };

                    this.waters.getHucData("HUC_12", coords.lat, coords.lng).subscribe(
                        (data) => {
                            if (data) {
                                this.layerService.addFeature("HUC", data);
                                this.updateSimData("selectedHuc", data);
                                this.updateState("huc", coords);
                            }

                            this.waters.getCatchmentData(coords.lat, coords.lng).subscribe(
                                (data) => {
                                    if (data) {
                                        this.layerService.addFeature("Catchment", data);
                                        this.updateSimData("selectedCatchment", data);
                                        this.updateState("pour_point_comid", data.features[0].properties.FEATUREID);
                                    }
                                    this.buildStreamNetwork(comid, distance);
                                },
                                (error) => {
                                    console.log("error getting catchment data: ", error);
                                }
                            );
                        },
                        (error) => {
                            console.log("error getting huc data: ", error);
                        }
                    );
                }

                if (data.catchmentInfo.ERROR) {
                    console.log("ERROR REBUILDING STREAM NETWORK: ", data.catchmentInfo.ERROR);
                    this.updateSimData("waiting", false);
                }
            },
            (error) => {
                console.log("error getting catchment data: ", error);
            }
        );
    }

    getState(): any {
        const state = this.cookieService.get("sim_setup");
        if (state) {
            return JSON.parse(state);
        }
        return null;
    }

    updateState(param, value): void {
        let state;
        if (this.cookieService.get("sim_setup")) {
            state = JSON.parse(this.cookieService.get("sim_setup"));
        } else state = {};

        state[param] = value;
        this.cookieService.set("sim_setup", JSON.stringify(state));
    }

    resetSimulation(): void {
        this.simData = { ...DefaultSimData.defaultSimData };
        this.cookieService.delete("sim_setup");
        this.clearHuc();
        this.updateSimData();
    }
}
