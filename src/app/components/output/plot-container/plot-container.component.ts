import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { Subscription } from "rxjs";
import { OutputService } from "src/app/services/output.service";
import { SimulationService } from "src/app/services/simulation.service";

@Component({
    selector: "app-plot-container",
    templateUrl: "./plot-container.component.html",
    styleUrls: ["./plot-container.component.css"],
})
export class PlotContainerComponent {
    // Index of drop list so we can delete it later
    @Input() index: number;
    @Input() dropListData: {
        selectedCatchments: string[];
        selectedTableCatchment: string;
        selectedSV: string;
        selectedChart: string;
    };

    catchments: any;
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
    chart: string = "table";
    // Table column setup variables
    tableColumnNames: string[] = [];
    tableColumnData: any[] = [];

    constructor(private simulationService: SimulationService, public outputService: OutputService) {
        this.simulationService.interfaceData().subscribe((data) => {
            for (let key of Object.keys(data)) {
                switch (key) {
                    case "network":
                        this.catchments = data[key].catchment_data;
                        this.stateVariablesList = Object.keys(this.catchments.values().next().value?.data ?? {});
                        this.selectedSV = this.stateVariablesList[this.dropListData?.selectedSV];
                        this.selectedCatchment = this.dropListData?.selectedTableCatchment;
                        this.chart = this.dropListData?.selectedChart;
                        this.setData();
                        break;
                    default:
                        break;
                }
            }
        });
        this.outputService.dropListDataSubject.subscribe((data) => {
            this.catchments && this.dropListData && this.setData();
        });
    }

    ngOnInit() {
        !this.catchments && this.simulationService.updateSimData();
    }

    @HostListener("unloaded")
    ngOnDestroy() {
        // Unsubscribe from the simulation data
        this.simulationService.interfaceData().unsubscribe();
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
        const dates = [];
        // Iterate over map and set plot data
        for (let [comid, data] of this.catchments) {
            if (dates.length === 0)
                data.dates.forEach((d) => dates.push(new Date(d)));
            // Get values for the selected state variable
            const values = [];
            data.data?.[this.selectedSV]?.forEach((d) => values.push(d));
            this.plotData.push({
                x: dates,
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
        this.tableColumnNames = [];
        this.tableColumnData = [];

        // Set column names
        this.tableColumnNames.push("Date");
        if (this.catchments) {
            Object.keys(this.catchments.values().next().value?.data ?? {}).forEach((key) => {
                this.tableColumnNames.push(key);
            });
            const dates = this.catchments.values().next().value?.dates;
            // Loop over length of data
            for (let i = 0; i < dates.length; i++) {
                let obj: any = {};
                // Loop over state variables
                for (let j = 1; j < this.tableColumnNames.length; j++) {
                    obj[this.tableColumnNames[0]] = new Date(this.catchments.get(this.selectedCatchment).dates[i])
                        .toString()
                        .split("GMT")[0];
                    obj[this.tableColumnNames[j]] = this.catchments.get(this.selectedCatchment).data[this.tableColumnNames[j]][i];
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

    // Delete the drop list item on click
    remove(event) {
        this.deleteItem.emit(this.index);
    }
}
