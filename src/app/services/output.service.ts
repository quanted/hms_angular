import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { HmsService } from "./hms.service";
import { SimulationService } from "./simulation.service";

@Injectable({
  providedIn: 'root',
})
export class OutputService {
  lineData: any[] = [];
  types: string[] = [];
  selected: string[] = [];
  chartColors: string[] = [];
  catchments: any = {};
  catchmentSubject = new Subject<any>();
  catchmentDataSubject = new Subject<any>();
  catchmentData: any;

  constructor(
    private hmsService: HmsService,
    private simulationService: SimulationService,
  ) {
    this.catchmentSubject.subscribe((value) => {
      this.catchments = value;
    });
    this.catchmentDataSubject.subscribe((value) => {
      this.catchmentData = value;
    });
  }

  /**
   * Makes request with simulation id to data endpoint and gets the catchments
   *  with task ids
   */
  getCatchments(): void {
    // Call data endpoint for current simid
    this.simulationService.simData["simId"] = "47bdaa9b-7d27-4486-8aa4-5501a190d7b9";
    this.hmsService
      .getAquatoxSimResults(this.simulationService.simData["simId"])
      .subscribe((data) => {
        this.catchmentSubject.next(data.catchments);
      });
  }
}
