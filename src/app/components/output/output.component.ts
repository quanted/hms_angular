import { Component, OnInit } from "@angular/core";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";

import { OutputService } from "src/app/services/output.service";

@Component({
    selector: "app-output",
    templateUrl: "./output.component.html",
    styleUrls: ["./output.component.css"],
})
export class OutputComponent implements OnInit {
    MAX_CONTAINERS = 6;
    outputPanels: any[] = [];

    DEFAULT_OUTPUT_PANELS = [
        { type: "Plot" },
        { type: "Plot" },
        { type: "Plot" },
        { type: "Segment List" },
        { type: "Table" },
    ];
    DEFAULT_PANEL_TYPE = "Plot";

    aboutHidden = true;
    simName = "";
    comidMenuHidden = true;

    outputData: any = {};

    constructor(private outputService: OutputService, private route: ActivatedRoute, private location: Location) {}

    ngOnInit() {
        if (this.route.snapshot.paramMap.has("comid")) {
            const comid = this.route.snapshot.paramMap.get("comid");
            if (comid) {
                this.outputService.getSegmentSimResults(comid);
            }
        }

        this.outputService.outputDashboardData().subscribe((outputData) => {
            if (outputData) {
                this.outputData = outputData;
            }
        });

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

    toggleAbout(): void {
        this.aboutHidden = !this.aboutHidden;
    }

    toggleComidMenu(): void {
        this.comidMenuHidden = !this.comidMenuHidden;
    }

    selectSegment(selection: string): void {
        this.outputService.selectSegment(selection);
        this.toggleComidMenu();
    }
}
