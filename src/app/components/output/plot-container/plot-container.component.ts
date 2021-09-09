import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChange, SimpleChanges } from "@angular/core";
import { OutputService } from "src/app/services/output.service";
import { SimulationService } from "src/app/services/simulation.service";

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
        selectedTableCatchment: string;
        selectedSV: string;
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
    // Selected catchment set by catchments selection
    selectedCatchment: string;
    // Selected State Variable set by sv selection
    selectedSV: string;
    // Plot title set by State Variables selection
    plotTitle: string;
    // Chart types set by chart type selection
    chart: string;
    // Table column setup variables
    tableColumnNames: string[] = [];
    tableColumnData: any[] = [];
    dates: Date[] = [];

    constructor(public outputService: OutputService) {
        this.outputService.dropListDataSubject.subscribe((data) => {
            this.catchment_data && this.setData();
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
                this.tableColumnNames = this.tableColumnNames.concat(this.stateVariablesList);
                // Set dates
                this.dates = [];
                this.catchment_data[firstComid].dates.forEach((d) => this.dates.push(new Date(d)));

                this.selectedSV = this.stateVariablesList[this.dropListData.selectedSV];
                this.selectedCatchment = this.dropListData.selectedTableCatchment;
                this.chart = this.dropListData.selectedChart;
                this.setData();
            }
        }
    }

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
            data["data"]?.[this.selectedSV]?.forEach((d) => values.push(d));
            this.plotData.push({
                x: this.dates,
                y: values,
                mode: this.chart,
                type: this.chart,
                name: comid,
                visible: this.dropListData?.selectedCatchments.includes(comid) ? "true" : "legendonly",
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
            // Loop over length of data
            for (let i = 0; i < this.dates.length; i++) {
                let obj: any = {};
                // Loop over state variables
                for (let j = 1; j < this.tableColumnNames.length; j++) {
                    obj[this.tableColumnNames[0]] = this.dates[i].toString().split("GMT")[0];
                    obj[this.tableColumnNames[j]] = this.catchment_data[this.selectedCatchment].data[this.tableColumnNames[j]][i];
                }
                // Push to table data
                this.tableColumnData.push(obj);
            }
        }
    }

    // Update on change of state variables
    svChange(event) {
        this.dropListData.selectedSV = this.selectedSV;
        this.outputService.dropListDataSubject.next(this.dropListData);
    }

    // Update on change of chart type
    chartChange(event) {
        this.dropListData.selectedChart = this.chart;
        this.outputService.dropListDataSubject.next(this.dropListData);
    }

    // Update on catchment selection change
    catchmentChange(event) {
        this.dropListData.selectedTableCatchment = this.selectedCatchment;
        this.outputService.dropListDataSubject.next(this.dropListData);
    }

    // Delete the drop list item on click
    remove(event) {
        this.deleteItem.emit(this.index);
    }
}
