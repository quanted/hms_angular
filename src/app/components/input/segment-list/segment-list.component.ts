import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";

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

  comidForm: FormGroup;

  constructor(
    private simulation: SimulationService,
    private layerService: LayerService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.simulation.interfaceData().subscribe((simData) => {
      this.boundarySegments = simData.segment_loadings.boundary;
      this.userSegments = simData.segment_loadings.user;
      this.selectedComId = simData.selectedComId;
    });
    this.comidForm = this.fb.group({
      comid: [""],
    });
  }

  addSegment(): void {
    this.selectSegment(this.comidForm.get("comid").value);
  }

  selectSegment(comid) {
    this.layerService.selectSegment(comid);
  }

  isActive(comid): boolean {
    return comid == this.selectedComId;
  }
}
