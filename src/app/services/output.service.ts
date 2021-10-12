import { Injectable, OnInit } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { BehaviorSubject, Subject } from "rxjs";
import { HmsService } from "./hms.service";
import { SimulationService } from "./simulation.service";

@Injectable({
    providedIn: "root",
})
export class OutputService {
    // Share drop list updates with output components
    dropListDataSubject: BehaviorSubject<any> = new BehaviorSubject(null);
    // List of catchments sorted in network order
    orderedCatchments: string[] = [];

    setOrderedCatchments(order: any) {
        this.orderedCatchments = [];
        for (let i = Object.keys(order).length - 1; i >= 0; i--) {
            for (let j = 0; j < order[i].length; j++) {
                this.orderedCatchments.push(order[i][j]);
            }
        }
    }
}
