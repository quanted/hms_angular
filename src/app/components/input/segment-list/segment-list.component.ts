import { Component, OnInit } from "@angular/core";

import { LayerService } from "src/app/services/layer.service";
import { SimulationService } from "src/app/services/simulation.service";

@Component({
  selector: "app-segment-list",
  templateUrl: "./segment-list.component.html",
  styleUrls: ["./segment-list.component.css"],
})
export class SegmentListComponent implements OnInit {
  boundarySegments = [];
  userSegments = [];
  selectedComId = null;

  constructor(
    private simulation: SimulationService,
    private layerService: LayerService
  ) {}

  ngOnInit(): void {
    this.simulation.interfaceData().subscribe((simData) => {
      this.boundarySegments = simData.segment_loadings.boundary;
      this.userSegments = simData.segment_loadings.user;
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
