/**
 * HttpInterceptor for catching errors from client side requests and server side responses.
 */
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";

import { EMPTY, Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

import { SimulationService } from "../services/simulation.service";

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    constructor(private injcetor: Injector) {}
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMsg: string;
                if (error.error instanceof ErrorEvent) {
                    console.log("Client side error");
                    errorMsg = `Error: ${error.error.message}`;
                } else {
                    console.log("Server side error");
                    errorMsg = `Error Code: ${error.status},  Message: ${error.message}`;
                    const simulation = this.injcetor.get(SimulationService);
                    if (simulation.isRebuilding()) {
                        simulation.resetSimulation();
                    }
                    simulation.updateSimData("waiting", false);
                }
                return throwError(errorMsg);
            })
        );
    }
}
