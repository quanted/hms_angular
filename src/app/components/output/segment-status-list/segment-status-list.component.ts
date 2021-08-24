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
    this.simulation.interfaceData().subscribe((d) => {
      this.updateInterface(d);
    });
  }

  updateInterface(data): void {
    if (data.sim_status.catchment_status.length) {
      this.segmentList = data.sim_status.catchment_status;
    }
  }

  gotoData(comId): void {
    this.router.navigateByUrl(`output/${comId}`);
  }
}
