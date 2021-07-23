import { Injectable } from "@angular/core";

import { BehaviorSubject } from "rxjs";

import { HmsService } from "./hms.service";

import * as testRequest1 from "../../base_jsons/test_compute_submit1.json";
import * as testRequest2 from "../../base_jsons/test_compute_submit2.json";
import * as testRequest3 from "../../base_jsons/test_compute_submit3.json";

@Injectable({
  providedIn: "root",
})
export class SimulationService {
  testCompute1 = (testRequest1 as any).default;
  testCompute2 = (testRequest2 as any).default;
  testCompute3 = (testRequest3 as any).default;

  computeExecution = 1;

  simData = {
    selectedComId: null,
    segment_loadings: {
      user: [],
      boundary: [],
    },
    pSetup: {
      StudyName: "",
      FirstDay: {
        val: "",
      },
      LastDay: {
        val: "",
      },
      StepSizeInDays: {
        val: false,
      },
      UseFixStepSize: {
        val: false,
      },
      FixStepSize: {
        val: null,
      },
    },
    comid_inputs: {},
    simulation_dependencies: [],
    catchment_dependencies: {},
  };
  simDataSubject: BehaviorSubject<any>;

  // list of data returned from hms requests
  hmsRequestedData = [];

  constructor(private hms: HmsService) {
    this.simDataSubject = new BehaviorSubject(this.simData);
  }

  addData(): void {
    let request = this.testCompute1;
    switch (this.computeExecution) {
      case 2:
        request = this.testCompute2;
        request["sim_id"] = this.simData["simId"];
        break;
      case 3:
        request = this.testCompute3;
        request["sim_id"] = this.simData["simId"];
        break;
      default:
        request = this.testCompute1;
    }
    this.hms.addAquatoxSimData(request).subscribe((response) => {
      console.log(`Compute${this.computeExecution} response: `, response);
      this.updateSimData("simId", response["_id"]);
      this.computeExecution >= 3
        ? (this.computeExecution = 1)
        : this.computeExecution++;
    });
  }

  executeSimulation(): void {
    this.hms
      .executeAquatoxSimulation(this.simData["simId"])
      .subscribe((response) => {
        console.log("Execute: ", response);
      });
  }

  getStatus(): void {
    this.hms
      .getAquatoxSimStatus(this.simData["simId"])
      .subscribe((response) => {
        let status = response.status;
        if (!status) status = response.error;
        console.log("Status: ", status);
        console.log("Simulation: ", response);
      });
  }

  getSimResults(): void {
    this.hms.getAquatoxSimResults(this.simData["simId"]).subscribe((data) => {
      console.log("Simulation results: ", data);
    });
  }

  downloadSimResults(): void {
    this.hms
      .downloadAquatoxSimResults(this.simData["simId"])
      .subscribe((data) => {
        const blob = new Blob([data], {
          type: "application/zip",
        });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      });
  }

  selectComId(comid): void {
    this.simData.selectedComId = comid;
    if (!this.simData.segment_loadings.boundary.includes(comid)) {
      this.updateSegmentList("user", comid);
    }
  }

  clearHuc(): void {
    this.simData["coords"] = {
      lat: null,
      lng: null,
    };
    this.updateSimData("huc", null);
  }

  clearCatchment(): void {
    this.simData.segment_loadings.user = [];
    this.simData.segment_loadings.boundary = [];
    this.simData["network"] = null;
    this.simData.selectedComId = null;
    this.updateSimData("catchment", null);
  }

  updateSegmentList(type, comid): void {
    switch (type) {
      case "user":
        if (!this.simData.segment_loadings.user.includes(comid)) {
          this.simData.segment_loadings.user.push(comid);
        }
        break;
      case "boundary":
        if (!this.simData.segment_loadings.boundary.includes(comid)) {
          this.simData.segment_loadings.boundary.push(comid);
        }
        break;
      default:
        console.log(`updateSegmentList.UNKNOWN_SEGMENT_TYPE: ${type}`);
    }
    this.updateSimData();
  }

  updateSimData(key?, data?): void {
    if (data) {
      if (key == "comid_inputs") {
        if (!this.simData.comid_inputs[data.comid]) {
          this.simData.comid_inputs[data.comid] = {
            sv: [],
          };
        }
        this.simData.comid_inputs[data.comid].sv.push(data.value);
      } else if (typeof data === "string" || typeof data === "number") {
        this.simData[key] = data;
      } else {
        this.simData[key] = { ...this.simData[key], ...data };
      }
    } else if (key && !data) {
      this.simData[key] = null;
    }
    this.simDataSubject.next(this.simData);
    // console.log("simData: ", this.simData);
  }

  // returns a Subject for interface components to subscribe to
  interfaceData(): BehaviorSubject<any> {
    return this.simDataSubject;
  }

  getSimData() {
    return this.simData;
  }

  // HMS api related functions
  updateData(endpoint, data): void {
    this.hmsRequestedData[endpoint] = data;
  }

  getData(): any {
    return this.hmsRequestedData;
  }

  getResponseList() {
    const responseList = [];
    const endpoints = Object.keys(this.hmsRequestedData);
    for (let endpoint of endpoints) {
      let d = this.hmsRequestedData[endpoint];
      console.log("d: ", d);
      responseList.push({
        endpoint,
        dataSource: d.dataSource,
        dataset: d.dataset,
      });
    }
    return responseList;
  }
}
