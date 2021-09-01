import { Injectable } from "@angular/core";
import { formatDate } from "@angular/common";

import { BehaviorSubject, forkJoin, Observable } from "rxjs";

import { CookieService } from "ngx-cookie-service";

import { HmsService } from "./hms.service";

import { DefaultSimData } from "../models/DefaultSimData";

@Injectable({
    providedIn: "root",
})
export class SimulationService {
    private simData = { ...DefaultSimData.defaultSimData };
    private simDataSubject: BehaviorSubject<any>;

    STATUS_CHECK_INTERVAL = 1000; // 1000 = 1 second interval
    statusCheck: ReturnType<typeof setInterval>; // interval that checks with backend and updates sim status

    constructor(private hms: HmsService, private cookieService: CookieService) {
        this.simDataSubject = new BehaviorSubject(this.simData);
    }

    // returns a Subject for interface components to subscribe to
    interfaceData(): BehaviorSubject<any> {
        return this.simDataSubject;
    }

    getFirstDay(): string {
        return formatDate(new Date(this.simData.PSetup.firstDay), "yyy-MM-dd", "en");
    }

    getLastDay(): string {
        return formatDate(new Date(this.simData.PSetup.lastDay), "yyy-MM-dd", "en");
    }

    getUpstreamDistance(): string {
        return "50";
    }

    getTimeStep(): string {
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
        this.updateSimData("json_flags", flags);
        this.hms.getBaseJsonByFlags(flags).subscribe((json) => {
            this.updateSimData("base_json", json);
            const sv = [];
            for (let key of Object.keys(json.AQTSeg.SV)) {
                sv.push(json.AQTSeg.SV[key]);
            }
            this.updateSimData("sv", sv);
        });
    }

    executeSimulation(pSetup): void {
        this.updateSimData("sim_executing", true);
        this.initializeAquatoxSimulation(pSetup).subscribe((response) => {
            this.updateSimData("simId", response["_id"]);

            this.cookieService.set("simId", response["_id"]);
            this.cookieService.set("pPoint", this.simData.network.pour_point_comid);
            this.cookieService.set("network", JSON.stringify(this.simData.network));

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
        if (this.simData["simId"]) {
            this.statusCheck = setInterval(() => {
                console.log("checking status...");
                this.hms.getAquatoxSimStatus(this.simData["simId"]).subscribe((simStatus) => {
                    this.updateSimData("sim_status", simStatus);
                    for (let comid of <any>Object.keys(simStatus.catchments)) {
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
                        console.log("simulation complete");
                        this.endStatusCheck();
                    }
                });
            }, this.STATUS_CHECK_INTERVAL);
        } else {
            this.updateSimData("status_message", "No simId for this simulation");
        }
    }

    addSimResults(comid, taskId): void {
        if (this.simData.network.catchment_data[comid] == null) {
            this.hms.getCatchmentData(taskId).subscribe((catchmentData) => {
                this.simData.network.catchment_data[comid] = catchmentData;
                this.updateSimData();
            });
        }
    }

    endStatusCheck(): void {
        clearInterval(this.statusCheck);
        console.log("end status checking...");
    }

    getStatus(): void {
        this.hms.getAquatoxSimStatus(this.simData["simId"]).subscribe((response) => {
            let status = response.status;
            if (!status) status = response.error;
            console.log(`Status: ${status}`, response);
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

    clearHuc(): void {
        this.simData["coords"] = {
            lat: null,
            lng: null,
        };
        this.updateSimData("huc", null);
    }

    clearCatchment(): void {
        this.simData.network.segments.boundary = [];
        this.simData.network.segments.headwater = [];
        this.simData.network.segments.inNetwork = [];
        this.simData["network"] = null;
        this.simData.selectedComId = null;
        this.updateSimData("catchment", null);
    }

    updateSegmentList(type, comid): void {
        switch (type) {
            case "boundary":
                if (!this.simData.network.segments.boundary.includes(comid)) {
                    this.simData.network.segments.boundary.push(comid);
                }
                break;
            case "headwater":
                if (!this.simData.network.segments.headwater.includes(comid)) {
                    this.simData.network.segments.headwater.push(comid);
                }
                break;
            case "inNetwork":
                if (!this.simData.network.segments.inNetwork.includes(comid)) {
                    this.simData.network.segments.inNetwork.push(comid);
                }
                break;
            default:
                console.log(`updateSegmentList.UNKNOWN_SEGMENT_TYPE: ${type}`);
        }
        this.updateSimData();
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

    resetSimulation(): void {
        this.simData = { ...DefaultSimData.defaultSimData };
        this.updateSimData();
    }
}
