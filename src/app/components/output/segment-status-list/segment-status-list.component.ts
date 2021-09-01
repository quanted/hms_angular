import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { SimulationService } from "src/app/services/simulation.service";

@Component({
    selector: "app-segment-status-list",
    templateUrl: "./segment-status-list.component.html",
    styleUrls: ["./segment-status-list.component.css"],
})
export class SegmentStatusListComponent implements OnInit {
    segmentList;

    constructor(private simulation: SimulationService, private router: Router) {}

    ngOnInit(): void {
        this.simulation.interfaceData().subscribe((simData) => {
            this.segmentList = simData.network.sources;
        });
    }

    gotoData(comId): void {
        this.router.navigateByUrl(`output/${comId}`);
    }
}
