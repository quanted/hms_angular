import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { HmsService } from "src/app/services/hms.service";
import { OutputService } from "src/app/services/output.service";
import { SimulationService } from "src/app/services/simulation.service";

@Component({
  selector: "app-plot-container",
  templateUrl: "./plot-container.component.html",
  styleUrls: ["./plot-container.component.css"],
  providers: [OutputService]
})
export class PlotContainerComponent implements OnInit {
  // Index of drop list so we can delete it later
  @Input() dropListData: number;
  // Output emitter to tell parent to delete
  @Output() deleteItem = new EventEmitter<any>();
  // Data received from the HmsService
  data: any;
  // Parsed data for the plot
  plotData: any[];
  // Parsed state variables from this.data
  stateVariablesList: string[] = [];
  // Parsed catchments
  catchmentList: string[] = [];
  // Selected catchment set by catchments selection
  selectedCatchment: string;
  // Selected State Variable set by sv selection
  selectedSV: string;
  // Plot title set by State Variables selection
  plotTitle: string;
  // Chart types set by chart type selection
  chart: string = "scatter";
  // Table column setup variables
  tableColumnNames: string[] = [];
  tableColumnData: any[] = [];

  constructor(
    public outputService: OutputService,
    private hmsService: HmsService,
    private simulationService: SimulationService
  ) {
    // Subscribe to changes in the catchments
    this.outputService.catchmentSubject.subscribe((catchments) => {
      // Set the catchment list and default selected catchment
      this.catchmentList = Object.keys(catchments);
      this.selectedCatchment = this.catchmentList[0];
      // Make request for catchment data
      this.hmsService
        .getCatchmentData(this.outputService.catchments[this.catchmentList[0]])
        .subscribe((data) => {
          this.data = data;
          // Get the state variables and set plot title, then set plot data
          this.stateVariablesList = Object.keys(this.data.data);
          this.selectedSV = this.stateVariablesList[0];
          this.setPlotData();
          this.setTableData();
        });
    });
  }

  ngOnInit(): void {
    this.outputService.getCatchments();
  }

  setData() {
    this.setTableData();
    this.setPlotData();
  }

  /**
   * Parses the data received from the HmsService and sets the plot data
   * which updates the @Input() data in the plotly component.
   */
  setPlotData() {
    const dates = [];
    this.data.dates.forEach((d) => dates.push(new Date(d)));
    const values = [];
    this.data.data[this.selectedSV].forEach((d) => values.push(d));
    this.plotData = [];
    this.plotData.push({
      x: dates,
      y: values,
      mode: this.chart,
      type: this.chart,
      name: this.selectedSV,
    });
    this.plotTitle = `Catchment: ${this.selectedCatchment} <br> ${this.selectedSV}`;
  }

  /**
   * Parses the data received from the HmsService and sets the table data
   * which updates the @Input() data in the table component. Places the 
   * data in the correct format for the table component.
   */
  setTableData() {
    // Reset tables values
    this.tableColumnNames = [];
    this.tableColumnData = [];

    // Set column names
    this.tableColumnNames.push("Date");
    Object.keys(this.data.data).forEach((key) => {
      this.tableColumnNames.push(key);
    });

    // Loop over length of data
    for (let i = 0; i < this.data.dates.length; i++) {
      let obj: any = {};
      // Loop over state variables
      for (let j = 1; j < this.tableColumnNames.length; j++) {
        obj[this.tableColumnNames[0]] = new Date(this.data.dates[i]).toString().split("GMT")[0];
        obj[this.tableColumnNames[j]] = this.data.data[this.tableColumnNames[j]][i];
      }
      // Push to table data
      this.tableColumnData.push(obj);
    }
  }

  catchmentChange(event) {
    // Make request for catchment data
    this.hmsService
      .getCatchmentData(this.outputService.catchments[this.selectedCatchment])
      .subscribe((data) => {
        this.data = data;
        this.setData();
      });
  }

  // Update on change of state variables
  svChange(event) {
    this.setData();
  }

  // Update on change of chart type
  chartChange(event) {
    this.setData();
  }

  // Delete the drop list item on click
  delete(event) {
    this.deleteItem.emit(this.dropListData);
  }

  downloadSimResults(): void {
    this.simulationService.downloadSimResults();
  }
}
