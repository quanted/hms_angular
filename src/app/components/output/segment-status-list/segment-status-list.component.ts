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
    for (let key of Object.keys(data)) {
      switch (key) {
        case "network":
          if (data[key]) {
            this.segmentList = Object.keys(data[key].sources);
          } else {
            this.segmentList = [];
          }
          break;
        default:
          break;
      }
    }
  }

  gotoData(comId): void {
    console.log(`gotoData(${comId})`);
    // this.router.navigateByUrl(`output/${comId}`);
  }
}
