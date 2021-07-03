import { Component, OnInit, ViewChild } from "@angular/core";
import { SimulationService } from "../../../services/simulation.service";
import { MapService } from "../../../services/map.service";
import { FormBuilder, FormGroup } from "@angular/forms";

import { HmsService } from "src/app/services/hms.service";

import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { LayerService } from "src/app/services/layer.service";

@Component({
  selector: "app-comid-select-input",
  templateUrl: "./comid-select-input.component.html",
  styleUrls: ["./comid-select-input.component.css"],
})
export class ComidSelectInputComponent implements OnInit {
  inputForm: FormGroup;
  svIndex = []; /* Get from service */

  addingParameter = false;
  addingSource = false;
  parameters = [];
  sources = [];

  useConstLoadings = true;

  uploadedTimeSeries = false;

  dataCSV = "";

  columnData = [];
  columnNames = [];

  selectedComId = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource = new MatTableDataSource();

  constructor(
    private fb: FormBuilder,
    private simulation: SimulationService,
    private layerService: LayerService
  ) {}

  ngOnInit(): void {
    this.inputForm = this.fb.group({
      constLoading: [""],
      loadingMulti: [""],
      altLoadings: [""],
      comid: [""],
    });

    this.simulation.interfaceData().subscribe((data) => {
      for (let key of Object.keys(data)) {
        switch (key) {
          case "selectedComId":
            this.initializeSegmentValues(data);
            break;
        }
      }
    });
  }

  initializeSegmentValues(simData): void {
    if (this.selectedComId !== simData.selectedComId) {
      this.addingParameter = false;
      this.addingSource = false;
    }
    this.selectedComId = simData.selectedComId;
    this.inputForm.get("comid").setValue(simData.selectedComId);
    if (simData.comid_inputs[this.selectedComId]) {
      this.parameters = simData.comid_inputs[this.selectedComId].sv;
    } else {
      this.parameters = [];
    }
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
    };
  }

  addSegment(): void {
    this.layerService.selectSegment(this.inputForm.get("comid").value);
  }

  addParameter(): void {
    this.addingParameter = true;
    this.addingSource = false;
  }

  addSource(): void {
    this.addingParameter = false;
    this.addingSource = true;
  }

  insertParameter() {
    this.addingParameter = false;
    // this.hmsService.validateCSV(this.dataCSV).subscribe();
    this.simulation.updateSimData("comid_inputs", {
      comid: this.selectedComId,
      type: "parameter",
      value: "new parameter object",
    });
  }

  insertSource() {
    this.addingSource = false;
    // this.hmsService.validateCSV(this.dataCSV).subscribe();
    this.simulation.updateSimData("comid_inputs", {
      comid: this.selectedComId,
      type: "source",
      value: "new source object",
    });
  }

  cancelAdd(): void {
    this.addingParameter = false;
    this.addingSource = false;
  }
}
