import { Component, OnInit } from "@angular/core";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { SimulationService } from "src/app/services/simulation.service";
import { OutputService } from "src/app/services/output.service";
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";

@Component({
    selector: "app-output",
    templateUrl: "./output.component.html",
    styleUrls: ["./output.component.css"],
})
export class OutputComponent implements OnInit {
    // Catchment data retrieved from simulation service
    catchment_data: any;
    // Comid retrieved as url param
    comid: string;
    // Max number of containers
    MAX_CONTAINERS = 6;
    // Array of drop list containers data.
    dropListData: any[] = [];
    // Show the about section
    showAbout = false;
    //Show panel
    showPanel = false;
    // List of catchments
    catchments: {
        catchment: string,
        selected: boolean
    }[] = [];
    //
    pourPoint: string = "";

    constructor(
        // Importing SimulationService to keep data from url navigation
        private simulationService: SimulationService,
        private outputService: OutputService,
        private route: ActivatedRoute,
        private location: Location
    ) { }

    ngOnInit() {
        // Get comid and set droplist data
        if (this.route.snapshot.paramMap.has("comid")) {
            this.comid = this.route.snapshot.paramMap.get("comid");
            this.setDefaultDropListData();
        }
        // Subscribe to simulationService to get data
        this.simulationService.interfaceData().subscribe((simData) => {
            // If catchment added to simData or catchment_data not yet set, update
            if (Object.keys(simData.network.catchment_data).length > 0 &&
                (!this.catchment_data ||
                    Object.keys(simData.network.catchment_data).length > Object.keys(this.catchment_data).length)) {
                // Deep copy new object to catchment_data to fire change detection 
                this.catchment_data = { ...simData.network.catchment_data };
                this.pourPoint = simData.network.pour_point_comid;
                for (let i = 0; i < Object.keys(this.catchment_data).length; i++) {
                    if (Object.keys(this.catchment_data)[i] == this.pourPoint) {
                        this.catchments.push({
                            catchment: Object.keys(this.catchment_data)[i],
                            selected: true
                        });
                    } else {
                        this.catchments.push({
                            catchment: Object.keys(this.catchment_data)[i],
                            selected: false
                        });
                    }
                }
            }
        });
    }

    drop(event: CdkDragDrop<any>) {
        // Swap indexes and items
        this.dropListData[event.previousContainer.data.index] = event.container.data.item;
        this.dropListData[event.container.data.index] = event.previousContainer.data.item;
        // Droplist changed, update cookie
        this.outputService.dropListDataSubject.next(this.dropListData);
        // Trigger resize event to make plotly redraw
        window.dispatchEvent(new Event("resize"));
    }

    add() {
        // Check if we can add another item
        if (this.dropListData.length < this.MAX_CONTAINERS) {
            let selectedCatchments: string[] = [];
            this.catchments.forEach(catchment => {
                if (catchment.selected)
                    selectedCatchments.push(catchment.catchment);
            });
            this.dropListData.push({
                selectedCatchments: selectedCatchments,
                selectedSV: 0,
                selectedChart: "scatter",
            });
        }
        this.outputService.dropListDataSubject.next(this.dropListData);
    }

    delete(index: number) {
        // Delete item from array
        for (let i = index; i < this.dropListData.length - 1; i++) {
            // Move all dropListData after the deleted one
            this.dropListData[i] = this.dropListData[i + 1];
        }
        // Delete last item
        this.dropListData.pop();
        // Droplist changed, update cookie
        this.outputService.dropListDataSubject.next(this.dropListData);
        // Trigger resize event to make plotly redraw
        window.dispatchEvent(new Event("resize"));
    }

    setDefaultDropListData() {
        // Set grid of containers
        this.dropListData = [];
        this.dropListData.push(
            {
                selectedCatchments: [this.comid],
                selectedSV: 0,
                selectedChart: "scatter",
            },
            {
                selectedCatchments: [this.comid],
                selectedSV: 1,
                selectedChart: "scatter",
            },
            {
                selectedCatchments: [this.comid],
                selectedSV: 2,
                selectedChart: "scatter",
            },
            {
                selectedCatchments: [this.comid],
                selectedSV: 3,
                selectedChart: "scatter",
            },
            {
                selectedCatchments: [this.comid],
                selectedSV: 0,
                selectedChart: "table",
            }
        );
    }

    back(): void {
        this.location.back();
    }

    aboutAQT(): void {
        this.showAbout = true;
    }

    closeAbout(): void {
        this.showAbout = false;
    }

    openHelp(): void {
        console.log("open Aquatox help");
    }

    togglePanel(event) {
        this.showPanel = !this.showPanel;
        window.dispatchEvent(new Event("resize"));
    }

    catchmentClick(catchment: any) {
        // Add catchment to selectedCatchments of dropListData if not already in
        this.dropListData.forEach((dropListItem) => {
            if (dropListItem.selectedCatchments.indexOf(catchment.catchment) === -1) {
                dropListItem.selectedCatchments.push(catchment.catchment);
            } else {
                dropListItem.selectedCatchments.splice(dropListItem.selectedCatchments.indexOf(catchment.catchment), 1);
            }
        });
        catchment.selected = !catchment.selected;
        this.outputService.dropListDataSubject.next(this.dropListData);
    }
}
