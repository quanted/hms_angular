import { Injectable } from "@angular/core";
import { formatDate } from "@angular/common";

import { BehaviorSubject, forkJoin, Observable } from "rxjs";

import { CookieService } from "ngx-cookie-service";

import { HmsService } from "./hms.service";

@Injectable({
  providedIn: "root",
})
export class SimulationService {
  simData = {
    pour_point_comid: null,
    selectedComId: null,
    segments: {
      boundary: [],
      headwater: [],
      inNetwork: [],
    },
    pSetup: {
      firstDay: "2000-01-01T00:00:00", // default one month
      lastDay: "2000-01-31T00:00:00", // time span
      stepSizeInDays: true,
      useFixStepSize: false,
    },
    base_json: null,
    network: {
      order: null,
      sources: null,
    },
    comid_inputs: {},
    simulation_dependencies: [],
    catchment_dependencies: {},
    sim_status: {
      status: "Starting...",
      status_message: "Initializing...",
      catchment_status: [],
    },
    sim_completed: false,
  };
  simDataSubject: BehaviorSubject<any>;

  statusCheck; // checks with backend and updates sim status

  constructor(private hms: HmsService, private cookieService: CookieService) {
    this.simDataSubject = new BehaviorSubject(this.simData);
  }

  executeSimulation(pSetup): void {
    this.initializeAquatoxSimulation(pSetup).subscribe((response) => {
      this.updateSimData("simId", response["_id"]);

      this.cookieService.set("simId", response["_id"]);
      this.cookieService.set("pPoint", this.simData.pour_point_comid);
      this.cookieService.set("network", JSON.stringify(this.simData.network));

      this.addCatchmentDependencies().subscribe((response) => {
        this.hms
          .executeAquatoxSimulation(this.simData["simId"])
          .subscribe((response) => {
            if (!response.error) {
              this.startStatusCheck();
            }
          });
      });
    });
  }

  initializeAquatoxSimulation(pSetup): Observable<any> {
    this.updateSimData("sim_completed", false);

    this.simData.pSetup.firstDay = pSetup.firstDay;
    this.simData.pSetup.lastDay = pSetup.lastDay;

    this.simData.base_json.AQTSeg.PSetup.FirstDay.Val = formatDate(
      pSetup.firstDay,
      "yyyy-MM-ddTHH:mm:ss",
      "en"
    );
    this.simData.base_json.AQTSeg.PSetup.LastDay.Val = formatDate(
      pSetup.lastDay,
      "yyyy-MM-ddTHH:mm:ss",
      "en"
    );

    this.simData.base_json.AQTSeg.PSetup.StepSizeInDays.Val =
      pSetup.tStep == "day" ? true : false;

    const initData = {
      comid_input: {
        comid: this.simData.pour_point_comid.toString(),
        input: this.simData.base_json,
      },
      network: {
        order: this.simData.network.order,
        sources: this.simData.network.sources,
      },
      simulation_dependencies: [],
      catchment_dependencies: [],
    };

    console.log("init: ", this.simData.base_json.AQTSeg.PSetup);
    return this.hms.addAquatoxSimData(initData);
  }

  addCatchmentDependencies(): Observable<any> {
    const dependencyRequests = [];
    for (let comid of Object.keys(this.simData.network.sources)) {
      dependencyRequests.push(this.addCatchmentDependency(comid));
    }
    return forkJoin(dependencyRequests);
  }

  addCatchmentDependency(comid): Observable<any> {
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
              startDate: formatDate(
                this.simData.pSetup.firstDay,
                "yyyy-MM-ddTHH:mm:ss",
                "en"
              ),
              endDate: formatDate(
                this.simData.pSetup.lastDay,
                "yyyy-MM-ddTHH:mm:ss",
                "en"
              ),
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
    return this.hms.addAquatoxSimData(dependency);
  }

  cancelAquatoxSimulationExecution(): void {
    this.hms
      .cancelAquatoxSimulationExecution(this.simData["simId"])
      .subscribe((response) => {
        this.updateSimData("sim_completed", true);
        this.endStatusCheck();
      });
  }

  startStatusCheck(): void {
    if (this.simData["simId"]) {
      this.statusCheck = setInterval(() => {
        console.log("checking status...");
        this.hms
          .getAquatoxSimStatus(this.simData["simId"])
          .subscribe((response) => {
            const catchment_status = [];
            for (let comid of Object.keys(response.catchments)) {
              let cStatus = {
                comid,
                status: response.catchments[comid].status,
              };
              if (cStatus.status == "IN-PROGRESS")
                cStatus["in_progress"] = true;
              if (cStatus.status == "COMPLETED") cStatus["completed"] = true;
              if (cStatus.status == "FAILED") cStatus["failed"] = true;
              catchment_status.push(cStatus);
            }
            let simStatus = {
              status: response.status,
              status_message: response.message,
              catchment_status,
            };
            this.updateSimData("sim_status", simStatus);
            if (
              !this.simData.sim_completed &&
              (response.status == "COMPLETED" || response.status == "FAILED")
            ) {
              this.updateSimData("sim_completed", true);
              console.log("simulation complete");
              this.endStatusCheck();
            }
          });
      }, 1000);
    } else {
      this.updateSimData("status_message", "No simId for this simulation");
    }
  }

  endStatusCheck(): void {
    clearInterval(this.statusCheck);
    console.log("end status checking...");
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
    this.updateSimData("selectedComId", comid);
  }

  clearHuc(): void {
    this.simData["coords"] = {
      lat: null,
      lng: null,
    };
    this.updateSimData("huc", null);
  }

  clearCatchment(): void {
    this.simData.segments.boundary = [];
    this.simData.segments.headwater = [];
    this.simData.segments.inNetwork = [];
    this.simData["network"] = null;
    this.simData.selectedComId = null;
    this.updateSimData("catchment", null);
  }

  updateSegmentList(type, comid): void {
    switch (type) {
      case "boundary":
        if (!this.simData.segments.boundary.includes(comid)) {
          this.simData.segments.boundary.push(comid);
        }
        break;
      case "headwater":
        if (!this.simData.segments.headwater.includes(comid)) {
          this.simData.segments.headwater.push(comid);
        }
        break;
      case "inNetwork":
        if (!this.simData.segments.inNetwork.includes(comid)) {
          this.simData.segments.inNetwork.push(comid);
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
      } else if (key == "sim_status") {
        this.simData.sim_status = data;
      } else if (key == "catchment_data") {
        if (!this.simData["catchment_data"]) {
          this.simData["catchment_data"] = data;
        }
        /*
        let found = false;
        for (let catchment of this.simData["catchment_data"]) {
          if (data.comid == catchment.comid) found = true;
        }
        if (!found) {
          this.simData["catchment_data"].push(data);
        }
        */
      } else if (key == "sv") {
        this.simData[key] = data;
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
  }

  // returns a Subject for interface components to subscribe to
  interfaceData(): BehaviorSubject<any> {
    return this.simDataSubject;
  }

  getSimData() {
    return this.simData;
  }

  getDefaultCatchmentDependencies() {
    return {
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
    };
  }
}
