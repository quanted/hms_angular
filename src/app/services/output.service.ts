import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { HmsService } from "./hms.service";
import { SimulationService } from "./simulation.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
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
    private http: HttpClient
  ) {
    this.catchmentSubject.subscribe((value) => {
      this.catchments = value;
    });
    this.catchmentDataSubject.subscribe((value) => {
      this.catchmentData = value;
    });
  }

  /**
   * Makes request with simulation id to data endpoint and gets the catchments with task ids
   */
  getCatchments(): void {
    // Call data endpoint for current simid
    // this.simulationService.simData["simId"] =
    //   "47bdaa9b-7d27-4486-8aa4-5501a190d7b9";
    this.hmsService
      .getAquatoxSimResults(this.simulationService.simData["simId"])
      .subscribe((data) => {
        console.log("getCatchments: ", data);
        this.catchmentSubject.next(data.catchments);
      });
  }

  getCatchmentData(taskId: string): Observable<any> {
    return this.http.get(
      `${environment.apiURL}/api/aquatox/workflow/archive-results/?task_id=${taskId}`
    );
  }

  /**
   * Filter the data to only show the selected variables.
   */
  filterData() {
    this.lineData = this.lineData.filter((line) => {
      return this.selected.indexOf(line.type) > -1;
    });
    console.log(this.lineData);
  }
}
