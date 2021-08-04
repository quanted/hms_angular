import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { OutputService } from "src/app/services/output.service";

@Component({
  selector: "app-plot-container",
  templateUrl: "./plot-container.component.html",
  styleUrls: ["./plot-container.component.css"],
})
export class PlotContainerComponent implements OnInit {
  data: any;
  plotData: any[];
  stateVariablesList: string[] = [];
  catchmentList: string[] = [];
  selectedCatchment: string;
  plotTitle: string;
  chart: string = "scatter";

  constructor(public outputService: OutputService) {
    // Subscribe to changes in the catchments
    this.outputService.catchmentSubject.subscribe((catchments) => {
      this.catchmentList = Object.keys(catchments);
      this.selectedCatchment = this.catchmentList[0];
      this.outputService
        .getCatchmentData(this.outputService.catchments[this.catchmentList[0]])
        .subscribe((data) => {
          this.data = data;
          // Get the state variables
          this.stateVariablesList = Object.keys(this.data.data);
          this.plotTitle = this.stateVariablesList[0];
          this.setPlotData(data);
        });
    });
  }

  ngOnInit(): void {
    // Get the catchments
    this.outputService.getCatchments();
  }

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
    this.outputService
      .getCatchmentData(this.outputService.catchments[this.selectedCatchment])
      .subscribe((data) => {
        this.data = data;
        this.setPlotData(data);
      });
  }

  svChange(event) {
    this.setPlotData(this.data);
  }

  chartChange(event) {
    this.setPlotData(this.data);
  }
}
