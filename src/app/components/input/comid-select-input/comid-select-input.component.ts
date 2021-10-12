import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { SimulationService } from "../../../services/simulation.service";
import { FormBuilder, FormGroup } from "@angular/forms";

import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { LayerService } from "src/app/services/layer.service";

@Component({
    selector: "app-comid-select-input",
    templateUrl: "./comid-select-input.component.html",
    styleUrls: ["./comid-select-input.component.css"],
})
export class ComidSelectInputComponent implements OnInit {
    container: HTMLElement;

    selectedComId = null;
    isBoundary = false;

    selectForm: FormGroup;
    reminForm: FormGroup;
    svForm: FormGroup;
    parameterForm: FormGroup;
    sourceForm: FormGroup;
    basicFields = null;

    // Total Soluble P in mg/L or  (as Non-Point-Source load, use Alt_Loadings[2]) or
    // Total P in mg/L   (set "TP_NPS" to true)

    // Total Ammonia as N in mg/L (Alt_Loadings[2] for NPS) and Nitrate as N in mg/L (Alt_Loadings[2] for NPS)  or
    // Total N in mg/L (set "TN_NPS" in "TNO3Obj" to true)

    // Organic Matter in mg/L ("DataType" = 2) or
    // Organic Carbon in mg/L ("DataType" = 1) or
    // CBOD in mg/L ("DataType" = 0)
    // Optional:  Percent_Part -- particulate vs. dissolved breakdown
    // Optional: Percent_Refr -- refractory (slow reacting) vs. labile (fast reacting) breakdown

    defaultSourceTypes = [
        {
            param: "TPO4Obj", // set "TP_NPS" in "TPO4Obj" to true
            displayName: "Total P",
            longName: "Total P in mg/L",
            unit: "mg/L",
        },
        {
            param: "TPO4Obj",
            displayName: "Total Soluble P",
            longName: "Total Soluble P in mg/L",
            unit: "mg/L",
        },
        {
            param: "TNO3Obj",
            displayName: "Total N", // set "TN_NPS" in "TNO3Obj" to true
            longName: "Total N in mg/L",
            unit: "mg/L",
        },
        {
            param: "TNH4Obj",
            displayName: "Total Ammonia as N",
            longName: "Total Ammonia as N in mg/L",
            unit: "mg/L",
        },
        {
            param: "TNO3Obj",
            displayName: "Nitrate as N",
            longName: "Nitrate as N in mg/L",
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

    sourceTypes = [];

    parameters: SegmentParameter[] = [];
    sources: SegmentParameter[] = [];

    addingParameter = false;
    addingSource = false;

    useConstLoadings = true;
    loadingRate = "Constant";

    uploadedTimeSeries = false;
    timeSeries = null;

    dataCSV = "";
    columnData = [];
    columnNames = [];

    @ViewChild(MatPaginator) paginator: MatPaginator;
    dataSource = new MatTableDataSource();

    constructor(private fb: FormBuilder, private simulation: SimulationService, private layerService: LayerService) {
        this.basicFields = this.simulation.getBasicFields();
    }

    ngOnInit(): void {
        this.selectForm = this.fb.group({
            comid: [""],
        });

        const reminFields = {};
        for (let field of this.basicFields.remin) {
            reminFields[field.param] = [];
        }
        this.reminForm = this.fb.group(reminFields);

        const svFields = {};
        for (let field of this.basicFields.sv) {
            svFields[field.param] = [];
        }
        this.svForm = this.fb.group(svFields);

        this.parameterForm = this.fb.group({
            constLoading: [""],
            loadingMulti: [""],
            altLoadings: [""],
        });

        this.sourceForm = this.fb.group({
            sourceOrigin: ["Point Source in g/day"],
            sourceType: [""],
            useConstLoadings: ["Constant"],
            constLoadingValue: [1],
            constLoadingMulti: [1],
        });

        this.simulation.interfaceData().subscribe((data) => {
            this.initializeSegmentForm(data);
        });
    }

    initializeSegmentForm(simData): void {
        if (this.selectedComId !== simData.selectedComId) {
            this.cancelAdd();
        }

        this.sourceTypes = [];
        for (let i = 0; i < simData.userAvailableVars.length; i++) {
            const foundVar = this.defaultSourceTypes.find((sourceType) => {
                return sourceType.displayName == simData.userAvailableVars[i];
            });
            if (foundVar) this.sourceTypes.push(foundVar);
        }
        if (this.sourceTypes.length) {
            this.sourceForm.get("sourceType").setValue(this.sourceTypes[0].displayName);
        }

        this.selectedComId = simData.selectedComId;
        if (this.selectedComId) {
            for (let seg of simData.network.segments.boundary) {
                if (this.selectedComId == seg.comid) {
                    this.isBoundary = true;
                    this.sourceForm.get("sourceOrigin").setValue("Boundary in mg/L");
                    break;
                } else {
                    this.isBoundary = false;
                    this.sourceForm.get("sourceOrigin").setValue("Point Source in g/day");
                }
            }
            this.selectForm.get("comid").setValue(simData.selectedComId);
            if (simData.network.catchment_loadings[this.selectedComId]) {
                const segmentLoadings = simData.network.catchment_loadings[this.selectedComId];
                if (segmentLoadings) {
                    // load stored remin and sv values
                    this.reminForm.setValue(segmentLoadings.remin);
                    this.svForm.setValue(segmentLoadings.sv);
                    // load parameters and sources
                    this.parameters = segmentLoadings.parameters == null ? [] : segmentLoadings.parameters;
                    this.sources = segmentLoadings.sources == null ? [] : segmentLoadings.sources;
                }
            } else {
                this.parameters = [];
                this.sources = [];
                if (simData.base_json) {
                    const remin = simData.base_json.AQTSeg.Location.Remin;
                    for (let variable of this.basicFields.remin) {
                        this.reminForm.get(variable.param).setValue(remin[variable.param].Val);
                    }
                    for (let variable of this.basicFields.sv) {
                        for (let defaultParam of simData.base_json.AQTSeg.SV) {
                            if (variable.param == defaultParam.$type) {
                                this.svForm.get(variable.param).setValue(defaultParam.InitialCond);
                            }
                        }
                    }
                }
            }
        }
    }

    // invoked by apply settings button
    addSegmentLoadings(): void {
        const loadings = {
            remin: this.reminForm.value,
            sv: this.svForm.value,
            properties: this.parameters,
            sources: this.sources,
        };
        this.simulation.addSegmentLoadings(this.selectedComId, loadings);
    }

    onFileChange($event) {
        this.uploadedTimeSeries = true;
        let file = $event.target.files[0];
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            let csv: string = reader.result as string;

            this.dataCSV = csv;
            const columnData = this.dataCSV.split("\n");
            this.columnNames = columnData[0].split(",");

            for (let i = 1; i < columnData.length; i++) {
                const row = columnData[i].split(",");
                const record = {};
                for (let j = 0; j < this.columnNames.length; j++) {
                    record[this.columnNames[j]] = row[j];
                }
                this.columnData.push(record);
            }

            this.dataSource.data = this.columnData;
            this.dataSource.paginator = this.paginator;

            // build and store time-series
            this.timeSeries = this.simulation.generateTimeSeries(columnData);
        };
    }

    selectSegment(): void {
        // this should probably be done by the simulation service
        this.layerService.selectSegment(this.selectForm.get("comid").value);
    }

    selectRate(): void {
        console.log("sForm: ", this.sourceForm.get("useConstLoadings").value);
        this.loadingRate = this.sourceForm.get("useConstLoadings").value;
    }

    addParameter(): void {
        // this.addingParameter = true;
        // this.addingSource = false;
    }

    addSource(): void {
        this.addingParameter = false;
        this.addingSource = true;
    }

    // adds a parameter to the list to be added when apply button is pressed
    insertParameter() {
        const origin = "";
        const type = "Parameter";
        const sim$type = null;
        const dataType = "Time-series";
        const data = this.timeSeries;

        this.parameters.push(new SegmentParameter(origin, type, sim$type, dataType, data));
        this.cancelAdd();
    }

    // adds a source to the list to be added when apply button is pressed
    insertSource() {
        const origin = this.sourceForm.get("sourceOrigin").value;
        const sourceType = this.sourceForm.get("sourceType").value;
        const loadingChoice = this.sourceForm.get("useConstLoadings").value;

        // console.log("insert: origin: ", origin, ", sourceType: ", sourceType, ", ", loadingChoice);
        // console.log("sourceTypes: ", this.sourceTypes);

        const sim$type = this.sourceTypes.find((field) => {
            if (field.displayName == sourceType) return field;
        }).param;

        let source: SegmentParameter = null;
        if (
            loadingChoice == "Constant" &&
            this.sourceForm.get("constLoadingValue").value !== null &&
            this.sourceForm.get("constLoadingMulti").value !== null
        ) {
            const dataType = "Constant";
            const data = this.sourceForm.get("constLoadingValue").value;
            source = new SegmentParameter(origin, sourceType, sim$type, dataType, data);
        } else if (loadingChoice == "Time-series" && this.timeSeries !== null) {
            const dataType = "Time-series";
            const data = this.timeSeries;
            source = new SegmentParameter(origin, sourceType, sim$type, dataType, data);
        }

        // only one entry per sim$type
        const foundSources = this.sources.filter((source) => {
            if (source.sim$type === sim$type && source.origin === origin) return source;
        });
        if (foundSources.length < 1) {
            this.sources.push(source);
            this.cancelAdd();
        }
        this.sourceForm.get("sourceType").setValue(this.sourceTypes[0].displayName);
    }

    removeSource(sourceToRemove): void {
        this.sources = this.sources.filter((source) => {
            if (source.sim$type !== sourceToRemove.sim$type || source.origin !== sourceToRemove.origin) return source;
        });
    }

    cancelAdd(): void {
        this.addingParameter = false;
        this.addingSource = false;
        this.uploadedTimeSeries = false;
        this.timeSeries = null;

        this.dataCSV = "";

        this.columnData = [];
        this.columnNames = [];
    }
}

class SegmentParameter {
    origin: string;
    type: string;
    sim$type: string;
    dataType: string;
    data: any;

    constructor(origin, type, sim$type, dataType, data) {
        this.origin = origin;
        this.type = type;
        this.sim$type = sim$type;
        this.dataType = dataType;
        this.data = data;
    }
}
