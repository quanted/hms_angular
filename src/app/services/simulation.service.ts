import { Injectable } from "@angular/core";

import { BehaviorSubject } from "rxjs";

import { HmsService } from "./hms.service";

@Injectable({
  providedIn: "root",
})
export class SimulationService {
  baseJsons = {};
  baseJson = {};

  simData = {};
  simDataSubject: BehaviorSubject<any>;

  // list of data returned from hms requests
  hmsRequestedData = [];

  constructor(private hms: HmsService) {
    this.simDataSubject = new BehaviorSubject(this.simData);
  }

  executeSimulation(): void {
    // example API (tenative):
    // POST ["/hms/api/workflow/"]
    // {
    // 	"sim_input": Main Simulation input json including all parameters (excluding boundary condition timeseries and loadings),
    // 	"comid_inputs: {
    // 		COMID_1: Unique input parameters for catchment=COMID_1, including boundary condition timeseries and loadings specified by the front-end user,
    // 		COMID_2: ...
    // 		...
    // 	},
    // 	"network: {
    // 		"order": network order of execution (found from the info/stream endpoint),
    // 		"sources: links catchment inputs dependencies to upstream catchments (parent)
    // 	}
    // }
    this.hms
      .executeAquatoxSimulation({
        sim_input: this.baseJson, // required
        network: this.simData["network"]
          ? {
              order: this.simData["network"].order,
              sources: this.simData["network"].sources,
            }
          : [], // required
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
      .subscribe((simId) => {
        console.log("simId: ", simId);
        this.updateSimData("simId", simId);
      });
  }

  selectComId(comid): void {
    this.updateSimData("selectedComId", { comid });
  }

  updateSimData(key, data): void {
    if (data) {
      this.simData[key] = { ...this.simData[key], ...data };
    } else {
      this.simData[key] = null;
    }
    this.simDataSubject.next(this.simData);
    console.log("simData: ", this.simData);
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
