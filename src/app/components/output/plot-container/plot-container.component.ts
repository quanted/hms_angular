import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { OutputService } from "src/app/services/output.service";

@Component({
    selector: "app-plot-container",
    templateUrl: "./plot-container.component.html",
    styleUrls: ["./plot-container.component.css"],
})
export class PlotContainerComponent implements OnChanges {
    // current plot type
    plotType: string;
    // Plot title set by State Variable selected
    plotTitle: string;
    // Parsed data for the plot
    plotData: any;
    stateVariablesList = [];

    // Sets plot css based on showing legend or not
    showLegend: boolean = false;

    constructor(public outputService: OutputService) {
        this.outputService.outputDashboardData().subscribe((data) => {
            this.createPlotyData(data);
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        // Check that the catchment_data has changed and that catchment_data not undefined
        // if (changes.hasOwnProperty("catchment_data") && this.catchment_data) {
        //     // Check that
        //     if (this.dropListData && Object.keys(this.catchment_data).length > 0) {
        //         this.catchmentList = Object.keys(this.catchment_data);
        //         const firstComid = this.catchmentList[0];
        //         this.stateVariablesList = Object.keys(this.catchment_data[firstComid].data);
        //         // Set table column names
        //         this.tableColumnNames = [];
        //         this.tableColumnNames.push("Date");
        //         this.tableColumnNames.push("Catchment");
        //         this.tableColumnNames = this.tableColumnNames.concat(this.stateVariablesList);
        //         // Set dates
        //         this.dates = [];
        //         this.catchment_data[firstComid].dates.forEach((d) => this.dates.push(new Date(d)));
        //         this.selectedSV = this.stateVariablesList[this.dropListData.selectedSV];
        //         this.chart = this.dropListData.selectedChart;
        //         this.setData();
        //     }
        // }
    }

    /**
     * transforms simData stored sim results into plotly data structures
     */
    createPlotyData(rawData) {
        this.plotTitle = "test plotly plot";
        this.plotData = [
            {
                x: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
                y: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                type: "bar",
            },
        ];

        // // Insert by network order into plot data
        // for (let catchment of this.outputData) {
        //     // Get values for the selected state variable
        //     const values = [];
        //     const data = this.catchment_data[catchment].data;
        //     data[this.selectedSV].forEach((d) => values.push(d));
        //     this.plotData.push({
        //         x: this.dates,
        //         y: values,
        //         mode: this.chart,
        //         type: this.chart,
        //         name: catchment,
        //         visible: this.dropListData.selectedCatchments.includes(catchment) ? "true" : "legendonly",
        //         marker: {
        //             size: 4,
        //         },
        //     });
        // }
        // this.plotTitle = this.selectedSV;
    }
    // Update on change of state variables
    svChange(event) {
        // this.dropListData.selectedSV = this.stateVariablesList.indexOf(this.selectedSV);
        // this.outputService.dropListDataSubject.next(this.dropListData);
    }

    // Update on change of chart type
    chartChange(event) {
        console.log("pre change: ", this.plotType);
    }

    addOrRemoveSelectedCatchment(catchment: string) {
        // if (this.dropListData.selectedCatchments.includes(catchment)) {
        //     this.dropListData.selectedCatchments.splice(this.dropListData.selectedCatchments.indexOf(catchment), 1);
        // } else {
        //     this.dropListData.selectedCatchments.push(catchment);
        // }
    }

    // Toggle plot css on click
    toggleCSS() {
        this.showLegend = !this.showLegend;
    }
}
