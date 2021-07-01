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
    this.simulation.interfaceData().subscribe((simData) => {
      this.boundarySegments = simData.segment_loadings.boundary;
      this.userSegments = simData.segment_loadings.user;
    });
  }

  selectSegment(comid) {
    console.log("selectSegment: ", comid);
  }
}
