import { Injectable } from "@angular/core";
import { formatDate } from "@angular/common";

import { BehaviorSubject, forkJoin, Observable } from "rxjs";

import { CookieService } from "ngx-cookie-service";

import { environment } from "src/environments/environment";
import { HmsService } from "./hms.service";
import { WatersService } from "./waters.service";

import { DefaultSimData } from "../models/DefaultSimData";
import { LayerService } from "./layer.service";

@Injectable({
    providedIn: "root",
})
export class SimulationService {
    private simData = { ...DefaultSimData.defaultSimData };
    private simDataSubject: BehaviorSubject<any>;

    STATUS_CHECK_INTERVAL = 1000; // 1000 = 1 second interval
    statusCheck: ReturnType<typeof setInterval>; // interval that checks with backend and updates sim status

    MAX_SEARCH_DISTANCE = 100;

    basicPSetupFields = [
        {
            param: "FirstDay",
            displayName: "First Day",
            longName: "",
            unit: "",
        },
        {
            param: "LastDay",
            displayName: "Last Day",
            longName: "",
            unit: "",
        },
        {
            param: "UseFixStepSize",
            displayName: "Use Fixed Step Size",
            longName: "",
            unit: "",
        },
        {
            param: "FixStepSize",
            displayName: "Fixed Step Size",
            longName: "",
            unit: "",
        },
        {
            param: "StepSizeInDays",
            displayName: "Step Size in Days",
            longName: "",
            unit: "",
        },
        {
            param: "SaveBRates", // save derivative rates false to save space
            displayName: "Save Derivitive Rates",
            longName: "",
            unit: "",
        },
        {
            param: "AverageOutput", // trapiziodal integration
            displayName: "Average Output",
            longName: "",
            unit: "",
        },
    ];

    advancedPSetupFields = [];

    basicLocaleFields = [];

    advancedLocaleFields = [];

    basicReminFields = [
        {
            param: "DecayMax_Lab",
            displayName: "Max. Degrdn Rate, labile",
            longName: "Maximum decomposition rate",
            unit: "g/g∙d",
        },
        {
            param: "DecayMax_Refr",
            displayName: "Max Degrdn Rate, Refrac",
            longName: "Maximum colonization rate under ideal conditions",
            unit: "g/g∙d",
        },
        {
            param: "KNitri",
            displayName: "KNitri, Max Rate of Nitrif.",
            longName: "Maximum rate of nitrification",
            unit: "1/day",
        },
        {
            param: "KDenitri_Wat",
            displayName: "KDenitri",
            longName: "Maximum rate of denitrification",
            unit: "1/day",
        },
    ];

    advancedReminFields = [];

    basicSVFields = [
        {
            param: "TNH4Obj",
            displayName: "Total Ammonia as N",
            longName: "Total Ammonia as N",
            unit: "mg/L",
        },
        {
            param: "TNO3Obj",
            displayName: "Nitrate as N",
            longName: "Nitrate as N",
            unit: "mg/L",
        },
        {
            param: "TCO2Obj",
            displayName: "Carbon dioxide",
            longName: "Carbon dioxide",
            unit: "mg/L",
        },
        {
            param: "TO2Obj",
            displayName: "Oxygen",
            longName: "Oxygen",
            unit: "mg/L",
        },
    ];

    advancedSVFields = [];

    // for future use
    SiteTypes = ["Pond", "Stream", "Reservr1D", "Lake", "Enclosure", "Estuary", "TribInput", "Marine"];

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

        this.layerService.layerErrorListener().subscribe((error) => {
            if (error) {
                console.log("layer error: ", error);
                this.resetSimulation();
            }
        });

        // console.log("allCookies: ", this.cookieService.getAll());
        // this.cookieService.deleteAll();

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
        return "20";
    }

    getDefaultTimeStep(): string {
        return "day";
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

    isRebuilding(): boolean {
        return this.simData.sim_rebuilding;
    }

    getBaseJsonByFlags(flags: any): void {
        this.updateSimData("waiting", true);
        this.hms.getBaseJsonByFlags(flags).subscribe((json) => {
            if (json.error) {
                // TODO: Handle error
                console.log("error>>> ", json.error);
                this.updateSimData("waiting", false);
            } else {
                this.simData.json_flags = flags;
                this.simData.base_json = json;
                this.simData.base_json.AQTSeg.PSetup.FirstDay.Val = formatDate(
                    this.simData.PSetup.firstDay,
                    "yyyy-MM-ddTHH:mm:ss",
                    "en"
                );
                this.simData.base_json.AQTSeg.PSetup.LastDay.Val = formatDate(
                    this.simData.PSetup.lastDay,
                    "yyyy-MM-ddTHH:mm:ss",
                    "en"
                );
                this.updateState("json_flags", flags);
                this.updateSimData("waiting", false);
            }
        });
    }

    // Available loadings are as follows:

    // Phosphorus:   MS_Phosphorus.json   (phosphorus button is the only one selected)
    // Total Soluble P in mg/L or  (as Non-Point-Source load, use Alt_Loadings[2]) or
    // Total P in mg/L   (set "TP_NPS" to true)

    // Nitrogen: MS_Nitrogen.json   (nitrogen button is the only one selected)
    // Total Ammonia as N in mg/L (Alt_Loadings[2] for NPS) and Nitrate as N in mg/L (Alt_Loadings[2] for NPS)  or
    // Total N in mg/L (set "TN_NPS" in "TNO3Obj" to true)

    // Nutrients:  MS_Nutrients.json  (nitrogen and phosphorus buttons selected)
    // Both the phosphorus and nitrogen options above.

    // OM:  MS_OM.json  (organic matter and phosphorus buttons selected, state of the nitrogen button is not relevant)
    // Both the phosphorus and nitrogen options above.
    // Also:  in "TDissRefrDetr" "DetritalInputRecordType":
    // Organic Matter in mg/L ("DataType" = 2) or
    // Organic Carbon in mg/L ("DataType" = 1) or
    // CBOD in mg/L ("DataType" = 0)
    // Optional:  Percent_Part -- particulate vs. dissolved breakdown
    // Optional: Percent_Refr -- refractory (slow reacting) vs. labile (fast reacting) breakdown

    // Important Note:  any loadings in the four organic matter types will be disregarded in favor of this somewhat unique input record ("DetritalInputRecordType")
    // MS_OM_NoP.json  (organic matter is selected, phosphorus button is not selected, state of the nitrogen button is not relevant)
    // Same as OM, no phosphorus data
    // An organic matter simulation requires nitrogen to be modeled.

    getAvailableVariables(): any {}

    getBasicFields(): any {
        return {
            pSetup: this.basicPSetupFields,
            locale: this.basicLocaleFields,
            remin: this.basicReminFields,
            sv: this.basicSVFields,
        };
    }

    getAdvancedFields(): any {
        return {
            pSetup: this.advancedPSetupFields,
            locale: this.advancedLocaleFields,
            remin: this.advancedReminFields,
            sv: this.advancedSVFields,
        };
    }

    applyGlobalSettings(settings): void {
        // sim_name is only for the frontend to use to track the simulation id
        // it is NOT used in the simulation.
        if (settings.pSetup.simulationName) {
            this.simData.sim_name = settings.pSetup.simulationName;
        }
        // these are in a format the datepickers in the forms like
        this.simData.PSetup.firstDay = settings.pSetup.firstDay;
        this.simData.PSetup.lastDay = settings.pSetup.lastDay;

        // values below are for the simulation
        this.simData.base_json.AQTSeg.PSetup.FirstDay.Val = formatDate(
            settings.pSetup.firstDay,
            "yyyy-MM-ddTHH:mm:ss",
            "en"
        );
        this.simData.base_json.AQTSeg.PSetup.LastDay.Val = formatDate(
            settings.pSetup.lastDay,
            "yyyy-MM-ddTHH:mm:ss",
            "en"
        );
        this.simData.base_json.AQTSeg.PSetup.StepSizeInDays.Val = settings.pSetup.tStep == "day" ? true : false;
        if (settings.pSetup.fixStepSize) {
            this.simData.base_json.AQTSeg.PSetup.FixStepSize = settings.pSetup.fixStepSize;
            this.simData.base_json.AQTSeg.PSetup.UseFixStepSize = true;
        }

        // set remin globals
        for (let param of Object.keys(settings.remin)) {
            if (this.simData.base_json.AQTSeg.Location.Remin[param]) {
                this.simData.base_json.AQTSeg.Location.Remin[param].Val = settings.remin[param];
            }
        }

        // set sv globals
        for (let param of Object.keys(settings.sv)) {
            for (let base_param of this.simData.base_json.AQTSeg.SV) {
                if (base_param.$type == param) {
                    base_param.InitialCond = settings.sv[param];
                    break;
                }
            }
        }
    }

    // adds a segments loadings to the simData object for retrieval when
    // initializeSegmentSimulation is invoked
    addSegmentLoadings(comid, loadings): void {
        this.simData.network.catchment_loadings[comid] = loadings;
        console.log("loadings: ", this.simData.network.catchment_loadings);
    }

    // errors will return a json dict {"error": error_message}
    // this whole thing needs to be flatMapped
    executeSimulation(): void {
        if (!this.simData.sim_executing) {
            this.updateSimData("waiting", true);
            this.initializeAquatoxSimulation().subscribe((response) => {
                if (response.error) {
                    // TODO: HANDLE ERROR
                    console.log("error>>> ", response.error);
                    this.updateSimData("waiting", false);
                } else {
                    this.updateSimData("simId", response["_id"]);
                    this.updateState("simId", response["_id"]);

                    this.submitCatchmentDependencies(Object.keys(this.simData.network.sources));
                }
            });
        }
    }

    initializeAquatoxSimulation(): Observable<any> {
        this.updateSimData("sim_completed", false);
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

    addCatchmentDependencies(comids): Observable<any> {
        const dependencyRequests = [];
        for (let comid of comids) {
            dependencyRequests.push(this.initializeSegmentSimulation(comid));
        }
        return forkJoin(dependencyRequests);
    }

    initializeSegmentSimulation(comid): Observable<any> {
        // deep copy the base_json to use for this segment
        let segment_json = JSON.parse(JSON.stringify(this.simData.base_json));
        const loadings = this.simData.network.catchment_loadings[comid];

        if (loadings) {
            // add segment remin
            for (let param of Object.keys(loadings.remin)) {
                if (segment_json.AQTSeg.Location.Remin[param]) {
                    segment_json.AQTSeg.Location.Remin[param].Val = loadings.remin[param];
                }
            }
            // add segment sv
            for (let param of Object.keys(loadings.sv)) {
                for (let base_param of segment_json.AQTSeg.SV) {
                    if (base_param.$type == param) {
                        base_param.InitialCond = loadings.sv[param];
                        break;
                    }
                }
            }
            // add parameters
            if (loadings.parameters?.length) {
                console.log(comid, " add parameters: ", loadings.parameters);
            }
            // add sources
            if (loadings.sources?.length) {
                console.log(comid, " add sources: ", loadings.sources);
            }
        }

        const segmentData = {
            sim_id: this.simData["simId"],
            comid_input: {
                comid: comid.toString(),
                input: segment_json,
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
        return this.hms.addAquatoxSimData(segmentData);
    }

    submitCatchmentDependencies(comids): void {
        const MaxExecuteAttmepts = 5;
        let executeFails = 0;
        this.addCatchmentDependencies(comids).subscribe((response) => {
            if (response.error) {
                // TODO: HANDLE ERROR
                console.log("error>>> ", response.error);
                this.updateSimData("waiting", false);
            } else {
                this.hms.executeAquatoxSimulation(this.simData["simId"]).subscribe((response) => {
                    if (response.error) {
                        console.log("error>>> ", response.error);
                        executeFails++;
                        if (executeFails >= MaxExecuteAttmepts) {
                            console.log(`Max execution retries of ${executeFails} reached`);
                            this.updateSimData("waiting", false);
                            return;
                        }
                        // There is a potential here for the dependency posts haven't been saved in the db
                        // even though the posts have all returned successfully
                        // when this happens the back end returns an error with the comis that are not ready yet
                        // just to be sure those comids will be resubmitted here and a new request to execute the
                        // will be sent, repeat until done.
                        let comids = response.error.split(":")[1];
                        comids = comids
                            .trim()
                            .split(",")
                            .map((comid) => {
                                return parseInt(comid);
                            });
                        console.log("resubmitting comids: ", comids);
                        // re-submit the catchment dependencies that the backend failed to save in time
                        this.submitCatchmentDependencies(comids);
                    } else {
                        this.updateSimData("sim_executing", true);
                        this.updateSimData("waiting", false);
                        this.startStatusCheck();
                    }
                });
            }
        });
    }

    cancelAquatoxSimulationExecution(): void {
        this.endStatusCheck();
        this.simData.waiting = false;
        this.simData.sim_executing = false;
        this.updateSimData("sim_completed", false);
        this.hms.cancelAquatoxSimulationExecution(this.simData["simId"]).subscribe((response) => {
            // console.log("cancel: ", response);
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

                    if (simStatus.status === "PENDING" || simStatus.status === "IN-PROGRESS") {
                        this.updateSimData("sim_completed", false);
                        this.updateSimData("sim_executing", true);
                    } else {
                        this.updateSimData("sim_completed", true);
                        this.updateSimData("sim_executing", false);
                        this.endStatusCheck();
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
        this.simData.downloading = true;
        this.updateSimData("waiting", true);
        this.hms.downloadAquatoxSimResults(this.simData["simId"]).subscribe((data) => {
            const blob = new Blob([data], {
                type: "application/zip",
            });
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_self");
            this.simData.downloading = false;
            this.updateSimData("waiting", false);
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
                if (data.metadata) {
                    this.simData.network.pour_point_comid = comid;
                    this.updateState("pour_point_comid", comid);
                    // now get the huc by coods
                    const coords = {
                        lat: data.metadata.CentroidLatitude,
                        lng: data.metadata.CentroidLongitude,
                    };
                    this.getHuc(coords);
                    this.getCatchment(coords);
                } else {
                    console.log("error>>>: ", data);
                    this.updateSimData("waiting", false);
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
                    if (this.simData.selectedHuc.properties.HUC_12 == data.features[0].properties.WBD_HUC12) {
                        this.layerService.addFeature("Catchment", data);
                        this.updateSimData("selectedCatchment", data);
                        this.updateState("pour_point_comid", data.features[0].properties.FEATUREID);
                    } else {
                        console.log(
                            `error>>> selected catchment is not contained within huc ${data.features[0].properties.WBD_HUC12}`
                        );
                    }
                }
                this.updateSimData("waiting", false);
            },
            (error) => {
                console.log("error getting catchment data: ", error);
            }
        );
    }

    buildNetworkWithEndComid(startComid, endComid) {
        console.log("not yet implemented!");
    }

    buildStreamNetwork(comid: string, distance: string): void {
        try {
            let d = parseInt(distance);
            if (d > this.MAX_SEARCH_DISTANCE) {
                d = this.MAX_SEARCH_DISTANCE;
                distance = d.toString();
            }
        } catch {
            console.log("unable to parse distance");
        }
        this.updateSimData("waiting", true);
        forkJoin([this.waters.getNetworkGeometry(comid, distance), this.hms.getNetworkInfo(comid, distance)]).subscribe(
            (networkData) => {
                if (networkData[0].error || networkData[1].error) {
                    console.log("error: ", networkData[0].error);
                    console.log("error: ", networkData[1].error);
                    this.resetSimulation();
                } else {
                    let geom = null;
                    let info = null;
                    for (let data of networkData) {
                        if (data.networkInfo) info = data.networkInfo;
                        if (data.networkGeometry) geom = data.networkGeometry;
                    }
                    // console.log("pour-point: ", this.simData.network.pour_point_comid);
                    // console.log("huc: ", this.simData.selectedHuc.properties.HUC_12);
                    // console.log("up/down: ", geom);
                    // console.log("info: ", info);
                    if (!info.sources) {
                        this.updateSimData("waiting", false);
                        return;
                    }
                    if (geom && info) {
                        this.updateState("upstream_distance", distance);
                        this.prepareNetworkGeometry(geom, info);
                    }
                }
                if (this.simData.sim_rebuilding) {
                    this.simData.sim_rebuilding = false;
                }
                this.updateSimData("waiting", false);
            },
            (error) => {
                console.log("forkJoin error: ", error);
                this.resetSimulation();
            }
        );
    }

    prepareNetworkGeometry(data, info): void {
        const selectedHuc = this.simData.selectedHuc.properties.HUC_12;
        const pourPointComid = this.simData.network.pour_point_comid.toString();
        const flowlines = data.output.flowlines_traversed;
        const networkComids = Object.keys(info.sources);

        const segments = {
            pourPoint: null,
            boundary: [],
            headwater: [],
            inNetwork: [],
            outOfHUC: [],
            outOfHUCSources: [],
            eventsEncountered: data.output.events_encountered,
        };

        // sorting out the segment geometries
        for (let comid of networkComids) {
            // find the corresponding geoJson object
            let geoSegment = flowlines.find((fl) => {
                return fl.comid.toString() === comid;
            });
            // find it's entry in info.network array
            let segmentInfo = info.network.find((segment) => {
                // the first element is the comid
                return geoSegment.comid.toString() === segment[0];
            });
            if (geoSegment && segmentInfo) {
                // the last element is the parent huc
                let geoSegmentHuc = segmentInfo[segmentInfo.length - 1];
                if (geoSegment.wbd_huc12.toString() !== geoSegmentHuc) {
                    console.log(`ERROR>>> PARENT HUC MISMATCH for Comid ${comid}!`);
                    console.log("aoi huc: ", selectedHuc);
                    console.log(`hms/networkInfo ${environment.apiURL}/api/info/streamnetwork: `, geoSegmentHuc);
                    console.log(
                        `waters/up-down ${environment.watersUrl}UpstreamDownstream.Service: `,
                        geoSegment.wbd_huc12
                    );
                }

                if (comid === pourPointComid) {
                    // if it's the pour point
                    segments.pourPoint = geoSegment;
                } else if (geoSegmentHuc == selectedHuc && !info.sources[comid].length) {
                    // else if it's in the selected huc and
                    // if it doesn't have any sources it's a headwater
                    segments.headwater.push(geoSegment);
                } else if (geoSegmentHuc == selectedHuc) {
                    // else if it's in the selected huc but not a headwater
                    // it might be a boundary segment
                    let isBoundary = false;
                    // so compare to the info
                    for (let outOfNetworkSegment of info.boundary["out-of-network"]) {
                        if (info.sources[comid].includes(outOfNetworkSegment)) {
                            // if it has an out-of-network source it's a boundary segment
                            // make sure it's only added once
                            if (!segments.boundary.includes(geoSegment)) {
                                segments.boundary.push(geoSegment);
                            }
                            isBoundary = true;
                        }
                    }
                    if (!isBoundary) {
                        // otherwise it's an in network segment
                        segments.inNetwork.push(geoSegment);
                    }
                } else {
                    segments.outOfHUC.push(geoSegment);
                }
            }
        }

        // TODO: get out of network sources to in boundary segments and display on map

        this.simData.network.segments = {
            pourPoint: segments.pourPoint,
            boundary: segments.boundary,
            headwater: segments.headwater,
            inNetwork: segments.inNetwork,
            totalNumSegments: [segments.pourPoint, ...segments.boundary, ...segments.inNetwork, ...segments.headwater]
                .length,
        };

        this.simData.network.order = info.order;
        this.simData.network.sources = info.sources;
        this.simData.network.network = info.network;

        this.layerService.buildStreamLayers(segments);
    }

    clearHuc(): void {
        this.updateSimData("selectedHuc", null);
        this.updateState("huc", null);
        this.clearCatchment();
        this.layerService.removeHuc();
    }

    clearCatchment(): void {
        this.simData.network = {
            pour_point_comid: null,
            upstream_distance: null,
            segments: {
                boundary: [],
                headwater: [],
                inNetwork: [],
                pourPoint: null,
                totalNumSegments: null,
            },
            sources: null,
            order: null,
            network: null,
            catchment_data: {},
            catchment_loadings: {},
        };
        // this.simData.network.segments.boundary = [];
        // this.simData.network.segments.headwater = [];
        // this.simData.network.segments.inNetwork = [];
        // this.simData.network.segments.pourPoint = null;
        // this.simData.network.segments.totalNumSegments = null;
        // this.simData.network.sources = null;
        // this.simData.network.order = null;
        // this.simData.network.network = null;
        // this.simData.network.catchment_data = {};
        // this.simData.network.catchment_loadings = {};
        this.simData.selectedComId = null;
        this.simData.base_json = null;
        this.simData.waiting = false;
        this.updateSimData("selectedCatchment", null);
        this.updateState("pour_point_comid", null);
        this.updateState("upstream_distance", null);
        this.layerService.removeCatchment();
    }

    clearCatchmentLoadings(): void {
        this.simData.network.catchment_loadings = {};
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
        // console.log("simData: ", this.simData);
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
        // console.log("lastState: ", lastState);
        if (lastState) {
            if (lastState.upstream_distance) {
                this.simData.network.upstream_distance = lastState.upstream_distance;
                this.rebuildStreamNetwork(lastState.pour_point_comid, lastState.upstream_distance);
            } else if (lastState.pour_point_comid) {
                this.simData.network.pour_point_comid = lastState.pour_point_comid;
                this.getCatchmentByComId(lastState.pour_point_comid);
            } else if (lastState.huc) {
                this.getHuc(lastState.huc);
            }
            if (lastState.json_flags) {
                this.simData.json_flags = lastState.json_flags;
                this.getBaseJsonByFlags(lastState.json_flags);
            }
            if (lastState.simId) {
                this.simData.network.pour_point_comid = lastState.pour_point_comid;
                this.simData.simId = lastState.simId;
                this.startStatusCheck();
            }
        }
    }

    rebuildStreamNetwork(comid, distance): void {
        this.simData.sim_rebuilding = true;
        this.updateSimData("waiting", true);
        this.hms.getCatchmentInfo(comid).subscribe(
            (data) => {
                if (data.metadata) {
                    this.simData.network.pour_point_comid = comid;
                    // now get the huc by coods
                    const coords = {
                        lat: data.metadata.CentroidLatitude,
                        lng: data.metadata.CentroidLongitude,
                    };

                    this.waters.getHucData("HUC_12", coords.lat, coords.lng).subscribe(
                        (data) => {
                            // if the error callback is called then data will be null
                            if (data) {
                                if (!data.error) {
                                    this.layerService.addFeature("HUC", data);
                                    this.updateSimData("selectedHuc", data);
                                    this.updateState("huc", coords);

                                    this.waters.getCatchmentData(coords.lat, coords.lng).subscribe(
                                        (data) => {
                                            if (data) {
                                                // if the error callback is called then data will be null
                                                if (!data.error) {
                                                    this.layerService.addFeature("Catchment", data);
                                                    this.updateSimData("selectedCatchment", data);
                                                    this.updateState(
                                                        "pour_point_comid",
                                                        data.features[0].properties.FEATUREID
                                                    );
                                                    this.buildStreamNetwork(comid, distance);
                                                } else {
                                                    console.log("error: ", data.error);
                                                    this.resetSimulation();
                                                }
                                            }
                                        },
                                        (error) => {
                                            console.log("error getting catchment data: ", error);
                                            this.resetSimulation();
                                        }
                                    );
                                } else {
                                    console.log("error: ", data.error);
                                    this.resetSimulation();
                                }
                            }
                        },
                        (error) => {
                            console.log("error getting huc data: ", error);
                            this.resetSimulation();
                        }
                    );
                } else {
                    console.log("ERROR REBUILDING STREAM NETWORK: ", data.ERROR);
                    this.resetSimulation();
                }
            },
            (error) => {
                console.log("error getting catchment data: ", error);
                this.resetSimulation();
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
        this.cookieService.set("sim_setup", JSON.stringify(state), { expires: 7 });
    }

    resetSimulation(): void {
        this.endStatusCheck();
        this.cookieService.delete("sim_setup");
        // deep copy default object
        this.simData = JSON.parse(JSON.stringify(DefaultSimData.defaultSimData));
        this.simDataSubject.next(this.simData);

        this.cancelAquatoxSimulationExecution();

        this.clearHuc();
    }

    generateTimeSeries(csvDataRows: string[]): any {
        const timeSeries = {};
        for (let i = 0; i < csvDataRows.length; i++) {
            // skip the header row
            if (i == 0) continue;
            const dataRow = csvDataRows[i].split(",");
            if (dataRow.length > 1) {
                timeSeries[formatDate(dataRow[0], "yyyy-MM-ddTHH:mm:ss", "en")] = dataRow.slice(1, dataRow.length);
            }
        }
        return timeSeries;
    }
}
