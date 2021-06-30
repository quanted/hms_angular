import { Component, OnInit } from "@angular/core";
import { SimulationService } from "src/app/services/simulation.service";

@Component({
  selector: "app-segment-list",
  templateUrl: "./segment-list.component.html",
  styleUrls: ["./segment-list.component.css"],
})
export class SegmentListComponent implements OnInit {
  boundarySegments = [];
  userSegments = [];

  constructor(private simulation: SimulationService) {}

  ngOnInit(): void {
    const simData = this.simulation.getSimData();
    if (simData["segment-loadings"]) {
      const segments = simData["segment-loadings"];
      this.boundarySegments = segments["boundary"];
      this.userSegments = segments["user"];
    }
  }

  selectSegment(comid) {
    console.log("selectSegment: ", comid);
  }
}
