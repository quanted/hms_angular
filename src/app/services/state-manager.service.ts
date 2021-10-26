import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";

@Injectable({
    providedIn: "root",
})
export class StateManagerService {
    constructor(private cookieService: CookieService) {}

    isSavedState(): boolean {
        return this.cookieService.check("sim_setup");
    }

    getState(): any {
        const state = this.cookieService.get("sim_setup");
        if (state) {
            return JSON.parse(state);
        }
        return null;
    }

    update(param, value): void {
        let state;
        if (this.cookieService.get("sim_setup")) {
            state = JSON.parse(this.cookieService.get("sim_setup"));
        } else state = {};

        state[param] = value;
        this.cookieService.set("sim_setup", JSON.stringify(state), { expires: 7 });
    }

    clearState(): void {
        this.cookieService.delete("sim_setup");
    }
}
