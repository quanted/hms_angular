import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { SimulationService } from "src/app/services/simulation.service";

@Component({
  selector: "app-execution-panel",
  templateUrl: "./execution-panel.component.html",
  styleUrls: ["./execution-panel.component.css"],
})
export class ExecutionPanelComponent implements OnInit {
  simStatus;
  status_message;
  simulationExecuting;
  simComplete;

  constructor(private simulation: SimulationService, private router: Router) {}

  ngOnInit(): void {
    this.simulation.interfaceData().subscribe((d) => {
      this.updateInterface(d);
    });
  }
  updateInterface(data): void {
    for (let key of Object.keys(data)) {
      switch (key) {
        case "sim_status":
          this.simStatus = data[key].status;
          this.status_message = data[key].status_message;
          break;
        case "sim_completed":
          if (data[key] === true) this.simulationExecuting = false;
          this.simComplete = data[key];
          break;
        default:
          break;
      }
    }
  }

  cancelExecution(): void {
    this.simulation.cancelAquatoxSimulationExecution();
  }

  gotoOutput(): void {
    this.router.navigateByUrl("output");
  }

  downloadSimResults(): void {
    this.simulation.downloadSimResults();
  }

  backToInput(): void {
    // reset sim status to return to input panel
  }
}
