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
    providers: [MiniMapService],
})
export class OutputComponent implements OnInit {
    // Catchment data retrieved from simulation service
    catchment_data: any;
    // Comid retrieved as url param
    comid: string;
    // Max number of containers
    MAX_CONTAINERS = 6;
    // Array of output dashboard output-panels.
    outputPanels: any[] = [];
    // Show the about section
    showAbout = false;
    //Show panel
    showLeftPanel = false;
    // List of catchments
    catchments: {
        catchment: string;
        selected: boolean;
        hovered: boolean;
    }[] = [];
    //
    pourPoint: string = "";
    // Toggle all catchments
    toggleAllCatchments: boolean;
    //
    mapInit: boolean = false;

    // refactor
    outputData: any = {};
    DEFAULT_OUTPUT_PANELS = [
        { type: "Plot" },
        { type: "Plot" },
        { type: "Plot" },
        { type: "Segment List" },
        { type: "Table" },
    ];
    DEFAULT_PANEL_TYPE = "Plot";

    constructor(
        private simulationService: SimulationService,
        private outputService: OutputService,
        private route: ActivatedRoute,
        private location: Location,
        private miniMap: MiniMapService
    ) {}

    ngOnInit() {
        if (this.route.snapshot.paramMap.has("comid")) {
            this.comid = this.route.snapshot.paramMap.get("comid");
            if (this.comid) {
                this.outputService.getSegmentSimResults(this.comid);
            }
        }

        this.outputService.outputDashboardData().subscribe((outputData) => {
            if (outputData) {
                this.outputData = outputData;
            }
        });

        // Subscribe to mini map hover event
        this.miniMap.comidHoverSubject.subscribe((comid: string) => {
            this.miniMap.selectSegment(this.catchments.find((catchment) => catchment.catchment == comid));
        });

        // Subscribe to mini map click event
        this.miniMap.comidClickSubject.subscribe((comid: string) => {
            const catchment = this.catchments.find((c) => c.catchment == comid);
            if (catchment) this.catchmentClick(catchment);
        });

        this.pourPoint = this.simulationService.getPourPoint();
        this.setOutputPanels(this.DEFAULT_OUTPUT_PANELS);
    }

    setOutputPanels(panels) {
        this.outputPanels = panels;
    }

    dropContainer(event: CdkDragDrop<any>) {
        // Swap indexes and items
        this.outputPanels[event.previousContainer.data.index] = event.container.data.item;
        this.outputPanels[event.container.data.index] = event.previousContainer.data.item;
        // Trigger resize event to make plotly redraw
        window.dispatchEvent(new Event("resize"));
    }

    addContainer() {
        if (this.outputPanels.length < this.MAX_CONTAINERS) {
            this.outputPanels.push({ type: this.DEFAULT_PANEL_TYPE });
        }
    }

    removeContainer(index: number) {
        // Delete item from array
        for (let i = index; i < this.outputPanels.length - 1; i++) {
            // Move all outputPanels after the deleted one
            this.outputPanels[i] = this.outputPanels[i + 1];
        }
        // Delete last item
        this.outputPanels.pop();
        // Trigger resize event to make plotly redraw
        window.dispatchEvent(new Event("resize"));
    }

    back(): void {
        this.location.back();
    }

    aboutAQT(): void {
        this.showAbout = !this.showAbout;
    }

    togglePanel(): void {
        this.showLeftPanel = !this.showLeftPanel;
        window.dispatchEvent(new Event("resize"));
    }

    catchmentClick(catchment: any) {
        console.log("catchment: ", catchment);
        catchment.selected = !catchment.selected;
        this.outputService.getSegmentSimResults(this.comid);
        // Add catchment to selectedCatchments of outputPanels if not already in
        if (catchment.selected) {
            this.outputPanels.forEach((dropListItem) => {
                if (dropListItem.selectedCatchments.indexOf(catchment.catchment) === -1) {
                    dropListItem.selectedCatchments.push(catchment.catchment);
                }
            });
        } else {
            this.outputPanels.forEach((dropListItem) => {
                if (dropListItem.selectedCatchments.indexOf(catchment.catchment) !== -1) {
                    dropListItem.selectedCatchments.splice(
                        dropListItem.selectedCatchments.indexOf(catchment.catchment),
                        1
                    );
                }
            });
        }
        // Toggle catchment on mini map
        this.miniMap.selectSegment(catchment);
    }

    catchmentMouseOn(catchment: any) {
        if (this.mapInit && this.miniMap.segmentLayers && this.miniMap.segmentLayers.length > 0) {
            this.miniMap.hoverSegment(catchment.catchment);
        }
    }

    catchmentMouseOut(catchment: any) {
        if (this.mapInit && this.miniMap.segmentLayers && this.miniMap.segmentLayers.length > 0)
            this.miniMap.selectSegment(catchment);
    }

    toggleAll() {
        this.toggleAllCatchments = !this.toggleAllCatchments;
        if (this.toggleAllCatchments) {
            this.catchments.forEach((catchment) => {
                catchment.selected = true;
            });
            // Add every catchment to selectedCatchments of outputPanels
            this.outputPanels.forEach((dropListItem) => {
                dropListItem.selectedCatchments = [];
                this.catchments.forEach((catchment) => {
                    dropListItem.selectedCatchments.push(catchment.catchment);
                });
            });
        } else {
            this.catchments.forEach((catchment) => {
                catchment.selected = false;
            });
            // Remove every catchment from selectedCatchments of outputPanels
            this.outputPanels.forEach((dropListItem) => {
                dropListItem.selectedCatchments = [];
            });
        }
        // Toggle catchments on mini map
        this.catchments.forEach((catchment) => {
            this.miniMap.selectSegment(catchment);
        });
    }
}
