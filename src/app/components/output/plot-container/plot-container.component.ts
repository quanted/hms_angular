import { ThisReceiver } from "@angular/compiler";
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { HmsService } from "src/app/services/hms.service";
import { OutputService } from "src/app/services/output.service";

@Component({
  selector: "app-plot-container",
  templateUrl: "./plot-container.component.html",
  styleUrls: ["./plot-container.component.css"],
})
export class PlotContainerComponent implements OnChanges {
  // Index of drop list so we can delete it later
  @Input() index: number;
  @Input() dropListData: {
    selectedCatchments: string[],
    selectedSV: string,
    selectedChart: string
  };
  // Output emitter to tell parent to delete
  @Output() deleteItem = new EventEmitter<any>();
  // Data received from the HmsService
  data: any[];
  // Parsed data for the plot
  plotData: any[] = [];
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
  chart: string = "table";
  // Table column setup variables
  tableColumnNames: string[] = [];
  tableColumnData: any[] = [];

  constructor(
    public outputService: OutputService,
    private hmsService: HmsService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.dropListData.firstChange) {
      // Set state variables
      this.stateVariablesList = this.outputService.stateVariablesList;
      this.selectedSV = this.dropListData.selectedSV;
      this.chart = this.dropListData.selectedChart;
      this.setData();
    }
  }

  ngOnInit(): void {
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
    if (this.outputService.catchments.size > 0) {
      // Get first entry to set dates
      const [k, v] = this.outputService.catchments;
      // Set dates for all data to reuse
      const dates = [];
      v !== undefined && v[1].dates.forEach((d) => dates.push(new Date(d)));
      // Iterate over map and set plot data
      for (let [k, v] of this.outputService.catchments) {
        console.log(k);
        // Get values for the selected state variable
        const values = [];
        v.data[this.selectedSV].forEach((d) => values.push(d));
        this.plotData.push({
          x: dates,
          y: values,
          mode: this.chart,
          type: this.chart,
          name: k,
          visible: 'false'
        });
        this.plotTitle = this.selectedSV;
      }
    }
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
    /*
    this.tableColumnNames.push("Date");
    Object.keys(this.data.data).forEach((key) => {
      this.tableColumnNames.push(key);
    });

    // Loop over length of data
    for (let i = 0; i < this.data.dates.length; i++) {
      let obj: any = {};
      // Loop over state variables
      for (let j = 1; j < this.tableColumnNames.length; j++) {
        //obj[this.tableColumnNames[0]] = new Date(this.data.dates[i]).toString().split("GMT")[0];
        //obj[this.tableColumnNames[j]] = this.data.data[this.tableColumnNames[j]][i];
      }
      // Push to table data
      this.tableColumnData.push(obj);
    }
    */
  }

  // Update on change of state variables
  svChange(event) {
    this.dropListData.selectedSV = this.selectedSV;
    this.outputService.dropListDataSubject.next(this.dropListData);
    this.plotData = [];
    this.setData();
  }

  // Update on change of chart type
  chartChange(event) {
    this.dropListData.selectedChart = this.chart;
    this.outputService.dropListDataSubject.next(this.dropListData);
    this.plotData = [];
    this.setData();
  }

  // Delete the drop list item on click
  remove(event) {
    this.deleteItem.emit(this.index);
  }
}
