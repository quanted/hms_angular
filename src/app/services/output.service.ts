import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { SimulationService } from "./simulation.service";
import { HmsService } from "./hms.service";

@Injectable({
    providedIn: "root",
})
export class OutputService {
    outputDataSubject: BehaviorSubject<any>;
    outputData: any = {};

    constructor(private simulationService: SimulationService, private hms: HmsService) {
        this.outputDataSubject = new BehaviorSubject(null);
    }

    outputDashboardData(): BehaviorSubject<any> {
        return this.outputDataSubject;
    }

    getSegmentSimResults(comid): void {
        if (!this.outputData[comid]) {
            let taskid = this.simulationService.getTaskId(comid);
            this.hms.getCatchmentArchiveResults(taskid).subscribe((catchmentData) => {
                // need to do some error/fail handling stuff here or in hmsService
                this.outputData[comid] = catchmentData;
                this.outputDataSubject.next(this.outputData);
            });
        }
    }
}
