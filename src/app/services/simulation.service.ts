import { Injectable } from "@angular/core";

import { BehaviorSubject } from "rxjs";

import { HmsService } from "./hms.service";

@Injectable({
  providedIn: "root",
})
export class SimulationService {
  baseJsons = [];
  baseJson = {};

  simData = {};
  simDataSubject: BehaviorSubject<any>;

  selectedCoords;
  selectedPourPoint;
  selectedHUC;
  selectedComId;

  // list of data returned from hms requests
  hmsRequestedData = [];

  constructor(private hms: HmsService) {
    this.simDataSubject = new BehaviorSubject(this.simData);
  }

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

  updateSimData(key, data): void {
    this.simData[key] = data;
    this.simDataSubject.next(this.simData);
  }

  // returns a Subject that component subscribes to
  getInterfaceData(): BehaviorSubject<any> {
    return this.simDataSubject;
  }

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

  selectATXModule(module): void {
    this.baseJson = null;
    for (let json of this.baseJsons) {
      if (json.name == module.toLowerCase()) {
        this.baseJson = json.AQTSim;
      }
      if (this.baseJson) break;
    }
    console.log(`${module} AQTsim: `, this.baseJson);
  }
}
