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
    pour_point_comid: null,
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
    base_json: null,
    network: {
      order: null,
      sources: null,
    },
    comid_inputs: {},
    simulation_dependencies: [],
    catchment_dependencies: {},
    default_catchment_dependency: {
      name: "streamflow",
      url: "api/hydrology/streamflow/",
      input: {
        source: "nwm",
        dateTimeSpan: {
          startDate: null,
          endDate: null,
        },
        geometry: {
          comID: null,
        },
        temporalResolution: "hourly",
        timeLocalized: "false",
      },
    },
    completed_segments: [],
    sim_completed: false,
  };
  simDataSubject: BehaviorSubject<any>;

  // list of data returned from hms requests
  hmsRequestedData = [];

  constructor(private hms: HmsService) {
    this.simDataSubject = new BehaviorSubject(this.simData);
  }

  initializeAquatoxSimulation(): void {
    const sources = this.simData.network.sources;
    let tempsources = {};

    for (let key of Object.keys(sources)) {
      if (key != "boundaries") {
        tempsources[key] = sources[key];
      }
    }

    const initData = {
      comid_input: {
        comid: this.simData.pour_point_comid.toString(),
        input: this.simData.base_json,
      },
      network: {
        order: this.simData.network.order,
        sources: tempsources,
      },
      simulation_dependencies: [],
      catchment_dependencies: [
        {
          name: "streamflow",
          url: "api/hydrology/streamflow/",
          input: {
            source: "nwm",
            dateTimeSpan: {
              startDate: "2000-01-01T00:00:00",
              endDate: "2000-12-31T00:00:00",
            },
            geometry: {
              comID: this.simData.pour_point_comid.toString(),
            },
            temporalResolution: "hourly",
            timeLocalized: "false",
          },
        },
      ],
    };
    this.hms.addAquatoxSimData(initData).subscribe((response) => {
      console.log("initSim: ", response);
      this.updateSimData("simId", response["_id"]);
      this.addCatchmentDependencies();
    });
  }

  addCatchmentDependencies(): void {
    const sources = this.simData.network.sources;

    for (let key of Object.keys(sources)) {
      if (key != "boundaries") {
        this.addCatchmentDependency(key);
      }
    }
  }

  addCatchmentDependency(comid): void {
    const dependency = {
      sim_id: this.simData["simId"],
      comid_input: {
        comid: comid.toString(),
        input: this.simData.base_json,
      },
      catchment_dependencies: [
        {
          name: "streamflow",
          url: "api/hydrology/streamflow/",
          input: {
            source: "nwm",
            dateTimeSpan: {
              startDate: "2000-01-01T00:00:00",
              endDate: "2000-01-31T00:00:00",
            },
            geometry: {
              comID: comid.toString(),
            },
            temporalResolution: "hourly",
            timeLocalized: "false",
          },
        },
      ],
    };
    this.hms.addAquatoxSimData(dependency).subscribe((response) => {
      console.log(`added dependency to comid ${comid}: `, response);
    });
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
        this.startStatusCheck();
      });
  }

  cancelAquatoxSimulationExecution(): void {
    this.hms
      .cancelAquatoxSimulationExecution(this.simData["simId"])
      .subscribe((response) => {
        console.log("Cancel: ", response);
      });
  }

  startStatusCheck(): void {
    let statusCheck = setInterval(() => {
      this.hms
        .getAquatoxSimStatus(this.simData["simId"])
        .subscribe((response) => {
          let status = response.status;
          if (!status) return;
          for (let comid of Object.keys(response.catchments)) {
            if (
              response.catchments[comid].status == "COMPLETED" ||
              response.catchments[comid].status == "FAILED"
            ) {
              this.updateSimData("completed_segments", {
                comid,
                status: response.catchments[comid].status,
              });
            }
          }
          if (response.status == "COMPLETED") {
            this.updateSimData("sim_completed", true);
            clearInterval(statusCheck);
          }
        });
    }, 500);
  }

  getStatus(): void {
    this.hms
      .getAquatoxSimStatus(this.simData["simId"])
      .subscribe((response) => {
        let status = response.status;
        if (!status) status = response.error;
        console.log(`Status: ${status}`, response);
      });
  }

  getSimResults(): any {
    this.hms.getAquatoxSimResults(this.simData["simId"]).subscribe((data) => {
      return data;
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
        window.open(url, "_self");
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
      } else if (key == "completed_segments") {
        for (let segment of this.simData.completed_segments) {
          if (segment.comid == data.comid) return;
        }
        this.simData[key].push(data);
      } else if (
        typeof data === "string" ||
        typeof data === "number" ||
        typeof data === "boolean"
      ) {
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
