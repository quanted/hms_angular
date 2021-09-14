import { Component, OnInit } from "@angular/core";

import { LayerService } from "src/app/services/layer.service";
import { SimulationService } from "src/app/services/simulation.service";

@Component({
    selector: "app-segment-list",
    templateUrl: "./segment-list.component.html",
    styleUrls: ["./segment-list.component.css"],
})
export class SegmentListComponent implements OnInit {
    pourPoint = null;
    boundarySegments = [];
    headwaterSegments = [];
    inNetworkSegments = [];
    totalNumSegments = null;
    selectedComId = null;

    constructor(private simulation: SimulationService, private layerService: LayerService) {}

    ngOnInit(): void {
        this.simulation.interfaceData().subscribe((simData) => {
            this.pourPoint = simData.network.segments.pourPoint;
            this.boundarySegments = simData.network.segments.boundary;
            this.headwaterSegments = simData.network.segments.headwater;
            this.inNetworkSegments = simData.network.segments.inNetwork;
            this.totalNumSegments = simData.network.segments.totalNumSegments;
            this.selectedComId = simData.selectedComId;
        });
    }

    selectSegment(comid) {
        this.layerService.selectSegment(comid);
    }

    isActive(comid): boolean {
        return comid == this.selectedComId;
    }
}
