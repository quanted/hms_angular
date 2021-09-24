import { Component, OnInit, ViewChild } from "@angular/core";
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
    selectedComId = null;
    segmentType = "boundary";

    selectForm: FormGroup;
    reminForm: FormGroup;
    svForm: FormGroup;
    parameterForm: FormGroup;
    sourceForm: FormGroup;
    basicFields = null;

    parameters: SegmentParameter[] = [];
    sources: SegmentParameter[] = [];

    addingParameter = false;
    addingSource = false;

    useConstLoadings = true;

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
            sourceOrigin: ["Point Source"],
            constLoading: [""],
            loadingMulti: [""],
            altLoadings: [""],
        });

        this.simulation.interfaceData().subscribe((data) => {
            this.initializeSegmentForm(data);
        });
    }

    initializeSegmentForm(simData): void {
        if (this.selectedComId !== simData.selectedComId) {
            this.cancelAdd();
        }
        this.selectedComId = simData.selectedComId;
        if (this.selectedComId) {
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

    addParameter(): void {
        // this.addingParameter = true;
        // this.addingSource = false;
    }

    addSource(): void {
        this.addingParameter = false;
        this.addingSource = true;
    }

    insertParameter() {
        const origin = "";
        const type = "Parameter";
        const dataType = "time-series";
        const data = this.timeSeries;

        this.parameters.push(new SegmentParameter(origin, type, dataType, data));
        this.cancelAdd();
    }

    insertSource() {
        const origin = this.sourceForm.get("sourceOrigin").value;
        const type = this.sourceForm.get("sourceType").value;
        const dataType = "time-series";
        const data = this.timeSeries;

        this.sources.push(new SegmentParameter(origin, type, dataType, data));
        this.cancelAdd();
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
    dataType: string;
    data: any;

    constructor(origin, type, dataType, data) {
        this.origin = origin;
        this.type = type;
        this.dataType = dataType;
        this.data = data;
    }
}
