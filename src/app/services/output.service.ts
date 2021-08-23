import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { BehaviorSubject, Subject } from "rxjs";
import { HmsService } from "./hms.service";
import { SimulationService } from "./simulation.service";

@Injectable({
  providedIn: 'root',
})
export class OutputService {
  previousSimId: string;
  // Map catchments to data
  catchments: Map<string, any> = new Map<string, any>();
  catchmentsSubject = new BehaviorSubject<any>(null);
  stateVariablesList: string[] = [];
  dropListDataSubject: BehaviorSubject<any> = new BehaviorSubject(null);

  // Array of drop list containers data.
  dropListData: {
    index: number,
    item: {
      selectedCatchments: string[],
      selectedSV: string,
      selectedChart: string
    }
  }[];

  constructor(
    private hmsService: HmsService,
    private simulationService: SimulationService,
    private cookieService: CookieService) {
    // Subscribe to changes in sim data
    this.simulationService.simDataSubject.subscribe((simData) => {
      this.simulationService.simData["simId"] = "47bdaa9b-7d27-4486-8aa4-5501a190d7b9";
      // Check for sim id
      if (this.simulationService.simData["simId"] !== undefined) {
        // Clear catchments if sim id has changed
        this.previousSimId !== this.simulationService.simData["simId"]
          && this.catchments.clear();
        // Check status of sim id
        this.hmsService
          .getAquatoxSimStatus(this.simulationService.simData["simId"])
          .subscribe((response) => {
            Object.keys(response.catchments).forEach((catchment) => {
              // For each catchment in the response check for data with task id
              // Only make request if data is not already in map
              // COMPLETED
              if (response.catchments[`${catchment}`].status === "COMPLETED") {
                this.hmsService
                  .getCatchmentData(response.catchments[`${catchment}`].task_id)
                  .subscribe((data) => {
                    this.catchments.set(catchment, data);
                    this.catchmentsSubject.next(null);
                  });
                // PENDING, IN-PROGRESS, FAILED
              } else {
                this.catchments.set(catchment, {
                  status: response.catchments[`${catchment}`].status,
                });
              }
            });
          });
      }
    });
  }

  setSVList() {
    if (this.catchments.size > 0) {
      this.stateVariablesList = Object.keys(this.catchments.entries().next().value?.[1].data)
    }
  }
}
