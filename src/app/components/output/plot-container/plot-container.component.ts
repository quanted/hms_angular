import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { HmsService } from "src/app/services/hms.service";
import { OutputService } from "src/app/services/output.service";

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
  // Plot title set by State Variables selection
  plotTitle: string;
  // Chart types set by chart type selection
  chart: string = "scatter";

  constructor(
    public outputService: OutputService,
    private hmsService: HmsService
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
          this.plotTitle = this.stateVariablesList[0];
          this.setPlotData(data);
        });
    });
  }

  ngOnInit(): void {
    this.outputService.getCatchments();
  }

  /**
   * Parses the data received from the HmsService and sets the plot data
   * which updates the @Input() data in the plotly component.
   */
  setPlotData(data) {
    const dates = [];
    data.dates.forEach((d) => dates.push(new Date(d)));
    const values = [];
    data.data[this.plotTitle].forEach((d) => values.push(d));

    this.plotData = [];
    this.plotData.push({
      x: dates,
      y: values,
      mode: this.chart,
      type: this.chart,
      name: this.plotTitle,
    });
  }

  catchmentChange(event) {
    // Make request for catchment data
    this.hmsService
      .getCatchmentData(this.outputService.catchments[this.selectedCatchment])
      .subscribe((data) => {
        this.data = data;
        this.setPlotData(data);
      });
  }

  // Update on change of state variables
  svChange(event) {
    this.setPlotData(this.data);
  }

  // Update on change of chart type
  chartChange(event) {
    this.setPlotData(this.data);
  }

  // Delete the drop list item on click
  delete(event) {
    this.deleteItem.emit(this.dropListData);
  }
}
