import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable, of, TimeoutError } from "rxjs";
import { catchError, map, timeout } from "rxjs/operators";

import { environment } from "../../environments/environment";

@Injectable({
    providedIn: "root",
})
export class HmsService {
    REQUEST_TIMEOUT = 60000; // 1000 = 1 second

    constructor(private http: HttpClient) {}

    getATXJsonFlags(): Observable<any> {
        return this.http.get(`${environment.apiURL}/api/aquatox/input-builder/base-json/flags`);
    }

    getBaseJsonByFlags(flags): Observable<any> {
        return this.http.post(
            `${environment.apiURL}/api/aquatox/input-builder/base-json/flags/`,
            JSON.stringify(flags)
        );
    }

    getStreamNetwork(comid, distance): Observable<any> {
        return this.http
            .get(`${environment.apiURL}/api/info/streamnetwork?comid=${comid}&maxDistance=${distance}`)
            .pipe(
                map((data) => {
                    console.log("hms: ", data);
                    data = {
                        networkInfo: { ...data },
                    };
                    return data;
                }),
                timeout(this.REQUEST_TIMEOUT),
                catchError((error) => {
                    if (error instanceof TimeoutError) {
                        console.log("hms timeout: '", error);
                        return of({ error: "Request to getNetworkInfo timed out", message: error.message });
                    } else {
                        console.log("hms error: ", error);
                        return of({ error });
                    }
                })
            );
    }

    addAquatoxSimData(simulation): Observable<any> {
        return this.http.post(`${environment.apiURL}/api/v2/hms/workflow/compute/`, JSON.stringify(simulation));
    }

    executeAquatoxSimulation(simId): Observable<any> {
        return this.http.get(`${environment.apiURL}/api/v2/hms/workflow/compute/?sim_id=${simId}`);
    }

    cancelAquatoxSimulationExecution(simId): Observable<any> {
        return this.http.delete(`${environment.apiURL}/api/v2/hms/workflow/compute/?sim_id=${simId}`);
    }

    getAquatoxSimStatus(simId): Observable<any> {
        return this.http.get(`${environment.apiURL}/api/v2/hms/workflow/status/?task_id=${simId}`);
    }

    // input and output flags add simulation data to the response
    getAquatoxSimResults(simId, input?, output?): Observable<any> {
        return this.http.get(
            `${environment.apiURL}/api/v2/hms/workflow/data/?task_id=${simId}&input=${input}&output=${output}`
        );
    }

    /**
     * Given a catchments taskid, returns the summarized data from its
     * simulation run.
     */
    getCatchmentData(taskId: string): Observable<any> {
        return this.http.get(`${environment.apiURL}/api/aquatox/workflow/archive-results/?task_id=${taskId}`);
    }

    downloadAquatoxSimResults(simId): Observable<any> {
        return this.http.get(`${environment.apiURL}/api/v2/hms/workflow/download/?task_id=${simId}`, {
            responseType: "arraybuffer",
        });
    }
}
