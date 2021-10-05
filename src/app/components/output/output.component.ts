import { Component, OnInit } from "@angular/core";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { SimulationService } from "src/app/services/simulation.service";
import { OutputService } from "src/app/services/output.service";
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { MiniMapService } from "src/app/services/mini-map.service";

@Component({
    selector: "app-output",
    templateUrl: "./output.component.html",
    styleUrls: ["./output.component.css"],
    providers: [MiniMapService]
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
        selected: boolean,
        hovered: boolean
    }[] = [];
    //
    pourPoint: string = "";
    // Toggle all catchments
    toggleAllCatchments: boolean;
    //
    mapInit: boolean = false;

    constructor(
        // Importing SimulationService to keep data from url navigation
        private simulationService: SimulationService,
        private outputService: OutputService,
        private route: ActivatedRoute,
        private location: Location,
        private miniMap: MiniMapService
    ) { }

    ngOnInit() {
        // Subscribe to mini map click event
        this.miniMap.comidClickSubject.subscribe((comid: string) => {
            const catchment = this.catchments.find(c => c.catchment == comid);
            if (catchment)
                this.catchmentClick(catchment);
        });
        // Get comid and set droplist data
        if (this.route.snapshot.paramMap.has("comid")) {
            this.comid = this.route.snapshot.paramMap.get("comid");
            this.setDefaultDropListData();
        }
        // Subscribe to simulationService to get data
        this.simulationService.interfaceData().subscribe((simData) => {
            // Build mini map
            if (!this.mapInit && simData.network.order && simData.network.order.length > 0) {
                this.miniMap.initMap(simData);
                this.mapInit = true;
            }
            // If catchment added to simData or catchment_data not yet set, update
            if (Object.keys(simData.network.catchment_data).length > 0 &&
                (!this.catchment_data ||
                    Object.keys(simData.network.catchment_data).length > Object.keys(this.catchment_data).length)) {
                // Deep copy new object to catchment_data to fire change detection 
                this.catchment_data = { ...simData.network.catchment_data };
                this.pourPoint = simData.network.pour_point_comid;
                this.catchments = [];
                for (let i = 0; i < Object.keys(this.catchment_data).length; i++) {
                    if (Object.keys(this.catchment_data)[i] == this.comid) {
                        this.catchments.push({
                            catchment: Object.keys(this.catchment_data)[i],
                            selected: true,
                            hovered: false
                        });
                    } else {
                        this.catchments.push({
                            catchment: Object.keys(this.catchment_data)[i],
                            selected: false,
                            hovered: false
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
        this.showAbout = !this.showAbout;
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
        catchment.selected = !catchment.selected;
        // Add catchment to selectedCatchments of dropListData if not already in
        if (catchment.selected) {
            this.dropListData.forEach((dropListItem) => {
                if (dropListItem.selectedCatchments.indexOf(catchment.catchment) === -1) {
                    dropListItem.selectedCatchments.push(catchment.catchment);
                }
            });
        } else {
            this.dropListData.forEach((dropListItem) => {
                if (dropListItem.selectedCatchments.indexOf(catchment.catchment) !== -1) {
                    dropListItem.selectedCatchments.splice(dropListItem.selectedCatchments.indexOf(catchment.catchment), 1);
                }
            });
        }
        // Toggle catchment on mini map
        this.miniMap.selectSegment(catchment);
        this.outputService.dropListDataSubject.next(this.dropListData);
    }

    catchmentMouseOn(catchment: any) {
        this.mapInit && this.miniMap.selectSegment({
            catchment: catchment.catchment,
            selected: catchment.selected ? false : true
        });
    }

    catchmentMouseOut(catchment: any) {
        this.mapInit && this.miniMap.selectSegment(catchment);
    }

    toggleAll() {
        this.toggleAllCatchments = !this.toggleAllCatchments;
        if (this.toggleAllCatchments) {
            this.catchments.forEach(catchment => {
                catchment.selected = true;
            });
            // Add every catchment to selectedCatchments of dropListData
            this.dropListData.forEach((dropListItem) => {
                dropListItem.selectedCatchments = [];
                this.catchments.forEach(catchment => {
                    dropListItem.selectedCatchments.push(catchment.catchment);
                });
            });
        } else {
            this.catchments.forEach(catchment => {
                catchment.selected = false;
            });
            // Remove every catchment from selectedCatchments of dropListData
            this.dropListData.forEach((dropListItem) => {
                dropListItem.selectedCatchments = [];
            });
        }
        // Toggle catchments on mini map
        this.catchments.forEach(catchment => {
            this.miniMap.selectSegment(catchment);
        });
        this.outputService.dropListDataSubject.next(this.dropListData);
    }
}
