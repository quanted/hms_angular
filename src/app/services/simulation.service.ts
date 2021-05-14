import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SimulationService {
  constructor() {}

  sessionData = [];

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
