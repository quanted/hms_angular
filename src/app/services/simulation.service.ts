import { Injectable } from "@angular/core";

import { BehaviorSubject } from "rxjs";

import { HmsService } from "./hms.service";

@Injectable({
  providedIn: "root",
})
export class SimulationService {
  simData = {
    segment_loadings: {
      user: [],
      boundary: [],
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

  executeSimulation(): void {
    this.hms
      .executeAquatoxSimulation({
        sim_input: this.simData["base_json"], // required
        network: this.simData["network"] ? this.simData["network"] : [], // required
        comid_inputs: this.simData["comid_loadings"]
          ? this.simData["comid_loadings"]
          : [],
        simulation_dependencies: this.simData["simulation_dependencies"]
          ? this.simData["simulation_dependencies"]
          : [],
        catchment_dependencies: this.simData["catchment_dependencies"]
          ? this.simData["catchment_dependencies"]
          : [],
      })
      .subscribe((response) => {
        this.updateSimData("simId", response["job_id"]);
      });
  }

  selectComId(comid): void {
    this.updateSimData("selectedComId", comid);
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
    this.simData["selectedComId"] = null;
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
