import { Injectable } from "@angular/core";
import { formatDate } from "@angular/common";

import { BehaviorSubject, forkJoin, Observable, of } from "rxjs";
import { mergeMap } from "rxjs/operators";

import { environment } from "src/environments/environment";
import { HmsService } from "./hms.service";
import { WatersService } from "./waters.service";

import { DefaultSimData } from "../models/DefaultSimData";
import { LayerService } from "./layer.service";
import { StateManagerService } from "./state-manager.service";

@Injectable({
    providedIn: "root",
})
export class SimulationService {
    private simData = { ...DefaultSimData.defaultSimData };
    private simDataSubject: BehaviorSubject<any>;

    STATUS_CHECK_INTERVAL = 1000; // 1000 = 1 second interval
    statusCheck: ReturnType<typeof setInterval>; // interval that checks with backend and updates sim status

    MaxExecuteAttmepts = 5;
    executeFails = 0;

    DEFAULT_UPSTREAM_DISTANCE = "20"; // upstream search in km
    MAX_SEARCH_DISTANCE = 100; // maximum upstream search in km

    DEFAULT_OUTPUT_STEP_SIZE = "hour";
    DEFAULT_SOLVER_STEP_SIZE = "0.1"; // of a day

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

    sourceTypes = [
        {
            param: "TPO4Obj", // set "TP_NPS" in "TPO4Obj" to true
            displayName: "Total P",
            longName: "Total P in mg/L",
            unit: "mg/L",
        },
        {
            param: "TPO4Obj", // set "TP_NPS" in "TPO4Obj" to false
            displayName: "Total Soluble P",
            longName: "Total Soluble P in mg/L",
            unit: "mg/L",
        },
        {
            param: "TNO3Obj", // set "TN_NPS" in "TNO3Obj" to true
            displayName: "Total N",
            longName: "Total N in mg/L",
            unit: "mg/L",
        },
        {
            param: "TNO3Obj", // set "TN_NPS" in "TNO3Obj" to false
            displayName: "Nitrate as N",
            longName: "Nitrate as N in mg/L",
            unit: "mg/L",
        },
        {
            param: "TNH4Obj",
            displayName: "Total Ammonia as N",
            longName: "Total Ammonia as N in mg/L",
            unit: "mg/L",
        },
        {
            param: "TDissRefrDetr", // "DataType" = 2
            displayName: "Organic Matter",
            longName: "Organic Matter in mg/L",
            unit: "mg/L",
        },
        {
            param: "TDissRefrDetr", // "DataType" = 1
            displayName: "Organic Carbon",
            longName: "Organic Carbon in mg/L",
            unit: "mg/L",
        },
        {
            param: "TDissRefrDetr", // "DataType" = 0
            displayName: "CBOD",
            longName: "CBOD in mg/L",
            unit: "mg/L",
        },
    ];

    // for future use
    SiteTypes = ["Pond", "Stream", "Reservr1D", "Lake", "Enclosure", "Estuary", "TribInput", "Marine"];

    constructor(
        private hms: HmsService,
        private waters: WatersService,
        private layerService: LayerService,
        private state: StateManagerService
    ) {
        this.simDataSubject = new BehaviorSubject(this.simData);
        this.simData.PSetup.firstDay = DefaultSimData.defaultSimData.PSetup.firstDay;
        this.simData.PSetup.lastDay = DefaultSimData.defaultSimData.PSetup.lastDay;

        this.layerService.clickListener().subscribe((comid) => {
            this.updateSimData("selectedComId", comid);
        });

        this.layerService.layerErrorListener().subscribe((error) => {
            if (error) {
                console.log("layer error: ", error);
                this.resetSimulation();
            }
        });

        if (this.state.isSavedState()) {
            this.rebuildSimData();
        }
    }

    // returns a Subject for interface components to subscribe to
    interfaceData(): BehaviorSubject<any> {
        return this.simDataSubject;
    }

    getSimulationName(): string {
        return this.simData.sim_name;
    }

    getDefaultFirstDay(): string {
        return formatDate(new Date(DefaultSimData.defaultSimData.PSetup.firstDay), "yyy-MM-dd", "en", "+0000");
    }

    getDefaultLastDay(): string {
        return formatDate(new Date(DefaultSimData.defaultSimData.PSetup.lastDay), "yyy-MM-dd", "en", "+0000");
    }

    getSimFirstDay(): string {
        return formatDate(new Date(this.simData.PSetup.firstDay), "yyy-MM-dd", "en", "+0000");
    }

    getSimLastDay(): string {
        return formatDate(new Date(this.simData.PSetup.lastDay), "yyy-MM-dd", "en", "+0000");
    }

    getDefaultUpstreamDistance(): string {
        return this.DEFAULT_UPSTREAM_DISTANCE;
    }

    getDefaultTimeStep(): string {
        return this.DEFAULT_OUTPUT_STEP_SIZE;
    }

    getDefaultSolverStep(): string {
        return this.DEFAULT_SOLVER_STEP_SIZE;
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

    getBaseJsonByFlags(flags: any, uVars): void {
        this.updateSimData("waiting", true);
        // console.log("flags: ", flags);
        this.hms.getBaseJsonByFlags(flags).subscribe((json) => {
            if (json.error) {
                // TODO: Handle error
                console.log("error>>> ", json.error);
            } else {
                //console.log("json: ", json);
                this.simData.json_flags = flags;
                this.simData.base_json = json;
                this.simData.base_json.AQTSeg.PSetup.FirstDay.Val = this.simData.PSetup.firstDay;
                this.simData.base_json.AQTSeg.PSetup.LastDay.Val = this.simData.PSetup.lastDay;
                this.updateSimData("userAvailableVars", uVars);
                this.state.update("userAvailableVars", uVars);
                this.state.update("json_flags", flags);
            }
            this.updateSimData("waiting", false);
        });
    }

    clearBaseJson(): void {
        this.updateSimData("json_flags", []);
        this.state.update("json_flags", null);
        this.state.update("userAvailableVars", null);
        this.updateSimData("base_json", null);
        this.clearCatchmentLoadings();
    }

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

    getSourceTypes(): any {
        return this.sourceTypes;
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
        this.state.update("firstDay", settings.pSetup.firstDay);
        this.state.update("lastDay", settings.pSetup.lastDay);

        // values below are for the simulation
        this.simData.base_json.AQTSeg.PSetup.FirstDay.Val = settings.pSetup.firstDay;
        this.simData.base_json.AQTSeg.PSetup.LastDay.Val = settings.pSetup.lastDay;
        this.simData.base_json.AQTSeg.PSetup.StepSizeInDays.Val = settings.pSetup.tStep == "day" ? true : false;
        if (settings.pSetup.useFixStepSize) {
            this.simData.base_json.AQTSeg.PSetup.UseFixStepSize.Val = true;
            this.simData.base_json.AQTSeg.PSetup.FixStepSize.Val = settings.pSetup.fixStepSize;
        } else {
            this.simData.base_json.AQTSeg.PSetup.UseFixStepSize.Val = false;
        }

        // set remin globals
        for (let param of Object.keys(settings.remin)) {
            if (this.simData.base_json.AQTSeg.Location.Remin[param]) {
                this.simData.base_json.AQTSeg.Location.Remin[param].Val = settings.remin[param];
            }
        }

        // set user variable globals
        for (let param of Object.keys(settings.uVars)) {
            for (let base_param of this.simData.base_json.AQTSeg.SV) {
                if (base_param.$type == param) {
                    if (base_param.InputRecord) {
                        base_param.InputRecord.InitCond = settings.uVars[param];
                    } else {
                        base_param.InitialCond = settings.uVars[param];
                    }
                    break;
                }
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

    getSegmentInfo(comid): any[] {
        return this.simData.network.network.find((segment) => {
            return segment[0] === comid.toString();
        });
    }

    // adds a segments loadings to the simData object for retrieval when
    // initializeSegmentSimulation is invoked
    addSegmentLoadings(comid, loadings): void {
        this.simData.network.catchment_loadings[comid] = loadings;
        // this.layerService.updateSegmentsWithLoadingsList(Object.keys(this.simData.network.catchment_loadings));
    }

    // errors will return a json dict {"error": error_message}
    executeSimulation(): void {
        if (!this.simData.sim_executing) {
            this.updateSimData("waiting", true);
            this.executeFails = 0;
            console.log("initializing simulation...");
            this.initializeAquatoxSimulation().subscribe((response) => {
                this.updateSimData("waiting", false);
                if (response.error) {
                    // TODO: HANDLE ERROR
                    console.log("failed to initialze simulation!");
                    console.log("error>>> ", response.error);
                } else {
                    this.updateSimData("simId", response["_id"]);
                    this.state.update("simId", response["_id"]);

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

        // SiteLength.Val
        const segmentInfo = this.getSegmentInfo(comid);
        if (segmentInfo) {
            segment_json.AQTSeg.Location.Locale.SiteLength.Val = segmentInfo[4];
        } else {
            console.log("could not find comid in network: ", comid);
        }

        let hmsReadyLoadings = [];
        if (loadings) {
            // add parameters
            if (loadings.parameters?.length) {
                console.log(comid, " add parameters: ", loadings.parameters);
            }
            // add sources
            if (loadings.sources?.length) {
                hmsReadyLoadings = this.convertLoadingsToHMSInputFormat(loadings.sources);
                console.log("loadings: ", loadings.sources);
                console.log("hmsReady: ", hmsReadyLoadings);
                return this.hms.insertSVLoadings({ flags: this.simData.json_flags, loadings: hmsReadyLoadings }).pipe(
                    mergeMap((svBlock) => {
                        // if there is a metadata property the sv block wasn't returned
                        if (svBlock.metadata) {
                            console.log("error>>> ", svBlock.metadata?.ERROR);
                            this.updateSimData("waiting", false);
                            return of({ error: `error inserting loadings ${svBlock.metadata}` });
                        }
                        if (svBlock) {
                            // console.log("insertedLoadings: ", svBlock);
                            segment_json.AQTSeg.SV = svBlock;
                            // add segment remin
                            for (let param of Object.keys(loadings.remin)) {
                                if (segment_json.AQTSeg.Location.Remin[param]) {
                                    segment_json.AQTSeg.Location.Remin[param].Val = loadings.remin[param];
                                }
                            }
                            // add segment uVars
                            for (let param of Object.keys(loadings.uVars)) {
                                for (let base_param of segment_json.AQTSeg.SV) {
                                    if (base_param.$type == param) {
                                        if (base_param.InputRecord) {
                                            base_param.InputRecord.InitCond = loadings.uVars[param];
                                        } else {
                                            base_param.InitialCond = loadings.uVars[param];
                                        }
                                        break;
                                    }
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
                                                startDate: formatDate(
                                                    this.simData.PSetup.firstDay,
                                                    "yyyy-MM-ddTHH:mm:ss",
                                                    "en"
                                                ),
                                                endDate: formatDate(
                                                    this.simData.PSetup.lastDay,
                                                    "yyyy-MM-ddTHH:mm:ss",
                                                    "en"
                                                ),
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
                            console.log("segment-with loadings: ", segmentData);
                            return this.hms.addAquatoxSimData(segmentData);
                        }
                    })
                );
            }
            // add segment remin
            for (let param of Object.keys(loadings.remin)) {
                if (segment_json.AQTSeg.Location.Remin[param]) {
                    segment_json.AQTSeg.Location.Remin[param].Val = loadings.remin[param];
                }
            }
            // add segment uVars
            for (let param of Object.keys(loadings.uVars)) {
                for (let base_param of segment_json.AQTSeg.SV) {
                    if (base_param.$type == param) {
                        if (base_param.InputRecord) {
                            base_param.InputRecord.InitCond = loadings.uVars[param];
                        } else {
                            base_param.InitialCond = loadings.uVars[param];
                        }
                        break;
                    }
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
        console.log("segment-json: ", segmentData);
        return this.hms.addAquatoxSimData(segmentData);
    }

    submitCatchmentDependencies(comids): void {
        this.addCatchmentDependencies(comids).subscribe((response) => {
            if (response.error) {
                // TODO: HANDLE ERROR
                console.log("error>>> ", response.error);
                this.updateSimData("waiting", false);
            } else {
                if (this.executeFails >= this.MaxExecuteAttmepts) {
                    console.log(`Max execution retries of ${this.executeFails} reached`);
                    this.updateSimData("waiting", false);
                    return;
                }
                this.hms.executeAquatoxSimulation(this.simData["simId"]).subscribe((response) => {
                    if (response.error) {
                        // There is a potential here for the dependency posts haven't been saved in the db
                        // even though the posts have all returned successfully
                        // when this happens the back end returns an error with the comis that are not ready yet
                        // just to be sure those comids will be resubmitted here and a new request to execute the
                        // will be sent, repeat until done.
                        this.executeFails++;
                        console.log("error>>> ", response.error);

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

    endStatusCheck(): void {
        clearInterval(this.statusCheck);
    }

    getStatus(): void {
        this.hms.getAquatoxSimStatus(this.simData["simId"]).subscribe((response) => {
            let status = response.status;
            if (!status) status = response.error;
        });
    }

    getTaskId(comid): string {
        const catchment = this.simData.sim_status.catchments.find((catchment) => {
            if (comid == catchment.comid) {
                return catchment;
            }
        });
        if (catchment) {
            const task_id = catchment.task_id;
            return task_id;
        }
        return `can't fing simData.sim_staus.catchments.comid.${comid}`;
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
                    this.state.update("pour_point_comid", comid);
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
                    this.state.update("huc", coords);
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
            (catchmentData) => {
                if (catchmentData.features) {
                    // console.log("waters-catchment: ", catchmentData);
                    let comid = catchmentData.features[0].properties.FEATUREID;
                    this.hms.getCatchmentInfo(comid).subscribe((catchmentInfo) => {
                        // console.log("hms-catchment: ", catchmentInfo);

                        // TODO: validate waters huc is same as hms huc, report if different
                        if (!catchmentInfo.error) {
                            if (this.simData.selectedHuc.properties.HUC_12 == catchmentInfo.metadata.HUC12) {
                                this.layerService.addFeature("Catchment", catchmentData);
                                this.updateSimData("selectedCatchment", catchmentData);
                                this.state.update("pour_point_comid", comid);
                            } else {
                                console.log(
                                    `error>>> selected catchment is not contained within huc ${this.simData.selectedHuc.properties.HUC_12}`
                                );
                            }
                        } else {
                            console.log("catchmentInfo.error: ", catchmentInfo);
                        }
                        this.updateSimData("waiting", false);
                    });
                } else {
                    this.updateSimData("waiting", false);
                    console.log("error>>> ", catchmentData.error);
                }
            },
            (error) => {
                console.log("error getting catchment data: ", error);
            }
        );
    }

    buildStreamNetwork(comid: string, distance: string, endComid?: string): void {
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
                        // console.log("geom: ", geom);
                        // console.log("info: ", info);
                        this.state.update("upstream_distance", distance);
                        this.prepareNetworkGeometry(geom, info);
                    }
                }
                if (this.simData.sim_rebuilding) {
                    this.simData.sim_rebuilding = false;
                }
            },
            (error) => {
                console.log("forkJoin error: ", error);
                // this.resetSimulation();
            },
            () => {
                this.updateSimData("waiting", false);
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
        this.state.update("huc", null);
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

        this.simData.selectedComId = null;
        this.simData.base_json = null;
        this.simData.userAvailableVars = [];
        this.simData.waiting = false;
        this.updateSimData("selectedCatchment", null);
        this.state.update("pour_point_comid", null);
        this.state.update("upstream_distance", null);
        this.layerService.removeCatchment();
    }

    clearCatchmentLoadings(): void {
        this.simData.network.catchment_loadings = {};
        this.simData.userAvailableVars = [];
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
            } else if (key == "userAvailableVars") {
                this.simData.userAvailableVars = [];
                for (let variable of data) {
                    let newVariable = this.sourceTypes.find((source) => {
                        return variable == source.displayName;
                    });
                    if (newVariable) {
                        if (newVariable.param == "TDissRefrDetr") {
                            let omType = newVariable.displayName;
                            let dataType = 0;
                            switch (omType) {
                                case "Organic Matter":
                                    dataType = 2;
                                    break;
                                case "Organic Carbon":
                                    dataType = 1;
                                    break;
                                case "CBOD":
                                    dataType = 0;
                                    break;
                            }
                            for (let base_param of this.simData.base_json.AQTSeg.SV) {
                                if (base_param.$type == "TDissRefrDetr") {
                                    base_param.InputRecord.DataType = dataType;
                                    break;
                                }
                            }
                        } else {
                            // switch (newVariable.param) {
                            //     case "Total P":
                            //         metadata["TP_NPS"] = true;
                            //         break;
                            //     case "Total Soluble P":
                            //         metadata["TP_NPS"] = false;
                            //         break;
                            //     case "Total N":
                            //         metadata["TN_NPS"] = true;
                            //         break;
                            //     case "Nitrate as N":
                            //         metadata["TP_NPS"] = false;
                            //         break;
                            // }
                        }
                        this.simData.userAvailableVars.push(newVariable);
                    }
                }
                this.state.update("userAvailableVars", data);
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

    rebuildSimData(): void {
        const lastState = this.state.getState();
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
                //console.log("last_state: ", lastState);
                this.simData.json_flags = lastState.json_flags;
                this.getBaseJsonByFlags(lastState.json_flags, lastState.userAvailableVars);
            }
            if (lastState.firstDay) {
                this.simData.PSetup.firstDay = lastState.firstDay;
                this.simData.PSetup.lastDay = lastState.lastDay;
            }
            if (lastState.userAvailableVars) {
                this.simData.userAvailableVars = lastState.userAvailableVars;
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
                                    this.state.update("huc", coords);

                                    this.waters.getCatchmentData(coords.lat, coords.lng).subscribe(
                                        (data) => {
                                            if (data) {
                                                // if the error callback is called then data will be null
                                                if (!data.error) {
                                                    this.layerService.addFeature("Catchment", data);
                                                    this.updateSimData("selectedCatchment", data);
                                                    this.state.update(
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

    returnToSetup(): void {
        this.simData.sim_completed = false;
        this.simData.simId = null;
        this.state.update("simId", null);
        this.updateSimData();
    }

    resetSimulation(): void {
        this.endStatusCheck();
        this.state.clearState();
        // deep copy default object
        this.simData = JSON.parse(JSON.stringify(DefaultSimData.defaultSimData));
        this.simDataSubject.next(this.simData);

        this.cancelAquatoxSimulationExecution();

        this.clearHuc();
    }

    generateTimeSeriesFromCSV(csvDataRows: string[]): any {
        const timeSeries = {};
        for (let i = 0; i < csvDataRows.length; i++) {
            // skip the header row
            if (i == 0) continue;
            const dataRow = csvDataRows[i].split(",");
            if (dataRow.length > 1) {
                timeSeries[formatDate(dataRow[0], "yyyy-MM-ddTHH:mm:ss", "en")] = dataRow[1].trim();
            }
        }
        console.log("timeSeries: ", timeSeries);
        return timeSeries;
    }

    convertLoadingsToHMSInputFormat(loadings): any[] {
        const segmentLoadings = [];
        for (let loading of loadings) {
            const newLoading = {};
            newLoading["param"] = loading.sim$type;
            loading.origin.startsWith("Point")
                ? (newLoading["loadingType"] = 0)
                : loading.origin.startsWith("Non-Point")
                ? (newLoading["loadingType"] = 2)
                : (newLoading["loadingType"] = -1);
            newLoading["useConstant"] = loading.dataType === "Constant" ? true : false;
            newLoading["useConstant"]
                ? (newLoading["constant"] = loading.data)
                : (newLoading["timeSeries"] = loading.data);
            newLoading["multiplier"] = loading.multiplier;
            const metadata = {};
            switch (loading.type) {
                case "Total P":
                    metadata["TP_NPS"] = true;
                    break;
                case "Total Soluble P":
                    metadata["TP_NPS"] = false;
                    break;
                case "Total N":
                    metadata["TN_NPS"] = true;
                    break;
                case "Nitrate as N":
                    metadata["TP_NPS"] = false;
                    break;
                case "Organic Matter":
                    metadata["DataType"] = 2;
                    break;
                case "Organic Carbon":
                    metadata["DataType"] = 1;
                    break;
                case "CBOD":
                    metadata["DataType"] = 0;
                    break;
                default:
                    break;
            }
            newLoading["metadata"] = metadata;
            segmentLoadings.push(newLoading);
        }
        return segmentLoadings;
    }
}
