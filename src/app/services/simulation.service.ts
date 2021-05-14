import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SimulationService {
  constructor() {}

  sessionData = [];

  baseJson = {};

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

  updateData(endpoint, data): void {
    this.sessionData[endpoint] = data;
  }

  getData(): any {
    return this.sessionData;
  }

  getResponseList() {
    const responseList = [];
    const endpoints = Object.keys(this.sessionData);
    for (let endpoint of endpoints) {
      let d = this.sessionData[endpoint];
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
