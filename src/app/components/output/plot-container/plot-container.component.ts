import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from "@angular/core";
import { OutputService } from "src/app/services/output.service";

@Component({
    selector: "app-plot-container",
    templateUrl: "./plot-container.component.html",
    styleUrls: ["./plot-container.component.css"],
})
export class PlotContainerComponent implements OnChanges {
    // Index of drop list so we can delete it later
    @Input() index: number;
    // Specific data for setting this container
    @Input() dropListData: {
        selectedCatchments: string[];
        selectedSV: number;
        selectedChart: string;
    };
    // Data input from output component
    @Input() catchment_data: any;
    // Output emitter to tell parent to delete
    @Output() deleteItem = new EventEmitter<any>();
    // Parsed data for the plot
    plotData: any;
    // Parsed state variables from this.data
    stateVariablesList: string[] = [];
    // Parsed catchments
    catchmentList: string[] = [];
    // Selected State Variable set by sv selection
    selectedSV: string;
    // Plot title set by State Variables selection
    plotTitle: string;
    // Chart types set by chart type selection
    chart: string;
    // Table column setup variables
    tableColumnNames: string[] = [];
    tableColumnData: any[] = [];
    // Dates for the plot and table
    dates: Date[] = [];
    // Sets plot css based on showing legend or not
    showLegend: boolean = false;

    constructor(public outputService: OutputService) {
        this.outputService.dropListDataSubject.subscribe((data) => {
            if (data && typeof data === "object" && this.catchment_data) {
                this.setData();
            }
            if (this.catchment_data
                && Object.keys(this.catchment_data).length > 0) {
                this.setData();
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        // Check that the catchment_data has changed and that catchment_data not undefined
        if (changes.hasOwnProperty("catchment_data") && this.catchment_data) {
            // Check that
            if (this.dropListData && Object.keys(this.catchment_data).length > 0) {
                this.catchmentList = Object.keys(this.catchment_data);
                const firstComid = this.catchmentList[0];
                this.stateVariablesList = Object.keys(this.catchment_data[firstComid].data);

                // Set table column names
                this.tableColumnNames = [];
                this.tableColumnNames.push("Date");
                this.tableColumnNames.push("Catchment");
                this.tableColumnNames = this.tableColumnNames.concat(this.stateVariablesList);
                // Set dates
                this.dates = [];
                this.catchment_data[firstComid].dates.forEach((d) => this.dates.push(new Date(d)));

                this.selectedSV = this.stateVariablesList[this.dropListData.selectedSV];
                this.chart = this.dropListData.selectedChart;
                this.setData();
            }
        }
    }

    /**
     * Set plot or table data based on the selected chart type.
     */
    setData() {
        if (this.chart === "table") {
            this.setTableData();
        } else {
            this.setPlotData();
        }
    }

    /**
     * Parses the data received from the HmsService and sets the plot data
     * which updates the @Input() data in the plotly component.
     */
    setPlotData() {
        this.plotData = [];
        // Iterate over map and set plot data
        for (let [comid, data] of Object.entries(this.catchment_data)) {
            // Get values for the selected state variable
            const values = [];
            data["data"][this.selectedSV].forEach((d) => values.push(d));
            this.plotData.push({
                x: this.dates,
                y: values,
                mode: this.chart,
                type: this.chart,
                name: comid,
                visible: this.dropListData.selectedCatchments.includes(comid) ? "true" : "legendonly",
                marker: {
                    size: 4,
                },
            });
        }
        this.plotTitle = this.selectedSV;
    }

    /**
     * Parses the data received from the HmsService and sets the table data
     * which updates the @Input() data in the table component. Places the
     * data in the correct format for the table component.
     */
    setTableData() {
        // Reset tables values
        this.tableColumnData = [];

        if (Object.keys(this.catchment_data).length > 0) {
            // Loop over each catchment 
            for (let i = 0; i < this.dates.length; i++) {
                // Loop over length of data
                for (let j = 0; j < this.dropListData.selectedCatchments.length; j++) {
                    let obj: any = {};
                    // Loop over state variables
                    for (let k = 2; k < this.tableColumnNames.length; k++) {
                        obj[this.tableColumnNames[0]] = this.dates[i].toString().split("GMT")[0];
                        obj[this.tableColumnNames[1]] = this.dropListData.selectedCatchments[j];
                        obj[this.tableColumnNames[k]] =
                            this.catchment_data[this.dropListData.selectedCatchments[j]]?.data[this.tableColumnNames[k]][j];
                    }
                    // Push to table data
                    this.tableColumnData.push(obj);
                }
            }
        }
    }

    // Update on change of state variables
    svChange(event) {
        this.dropListData.selectedSV = this.stateVariablesList.indexOf(this.selectedSV);
        this.outputService.dropListDataSubject.next(this.dropListData);
    }

    // Update on change of chart type
    chartChange(event) {
        this.dropListData.selectedChart = this.chart;
        this.outputService.dropListDataSubject.next(this.dropListData);
    }

    // Delete the drop list item on click
    remove(event) {
        this.deleteItem.emit(this.index);
    }

    addOrRemoveSelectedCatchment(catchment: string) {
        if (this.dropListData.selectedCatchments.includes(catchment)) {
            this.dropListData.selectedCatchments.splice(this.dropListData.selectedCatchments.indexOf(catchment), 1);
        } else {
            this.dropListData.selectedCatchments.push(catchment);
        }
    }

    // Toggle plot css on click
    toggleCSS() {
        this.showLegend = !this.showLegend;
        window.dispatchEvent(new Event("resize"));
    }
}
