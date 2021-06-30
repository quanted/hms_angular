import { Component, OnInit, ViewChild } from "@angular/core";
import { SimulationService } from "../../../services/simulation.service";
import { MapService } from "../../../services/map.service";
import { FormBuilder, FormGroup } from "@angular/forms";

import { HmsService } from "src/app/services/hms.service";

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: "app-comid-select-input",
  templateUrl: "./comid-select-input.component.html",
  styleUrls: ["./comid-select-input.component.css"],
})
export class ComidSelectInputComponent implements OnInit {
  inputFormGroup: FormGroup;
  svIndex = []; /* Get from service */
  useConstLoadings = true;

  uploadedTimeSeries = false;

  dataCSV = '';
  
  columnData = [];
  columnNames = [];

  selectedComId = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource = new MatTableDataSource();

  constructor(
    private fb: FormBuilder,
    private simulation: SimulationService,
    private hmsService: HmsService
  ) {}

  ngOnInit(): void {
    this.simulation.interfaceData().subscribe((data) => {
      for (let key of Object.keys(data)) {
        switch (key) {
          case "selectedComId":
            this.updateComId(data[key]);
        }
      }
    });

    this.inputFormGroup = this.fb.group({
      constLoading: [""],
      loadingMulti: [""],
      altLoadings: [""],
    });
  }

  updateComId(data): void {
    console.log("selectedComId: ", data);
    this.selectedComId = data.comid;
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
    }
    }

    validateLoadings() {
      this.hmsService.validateCSV(this.dataCSV).subscribe();
    }

    

  }

