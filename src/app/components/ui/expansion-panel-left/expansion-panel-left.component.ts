import { Component, Input } from "@angular/core";
import { CookieService } from "ngx-cookie-service";

@Component({
    selector: "app-expansion-panel-left",
    templateUrl: "./expansion-panel-left.component.html",
    styleUrls: ["./expansion-panel-left.component.css"],
})
export class ExpansionPanelLeftComponent {
    @Input() open: boolean;

    tooltipPosition = "right";

    showAbout = true;

    constructor(private cookieService: CookieService) {}

    ngOnInit(): void {
        if (this.cookieService.check("confirmation-about")) {
            this.showAbout = false;
        }
    }

    openPanel(): void {
        this.open = true;
    }

    closePanel(): void {
        this.open = false;
    }

    backToHMS(): void {
        window.open("https://ceamdev.ceeopdev.net/hms/", "_self");
    }

    aboutAQT(): void {
        this.showAbout = true;
    }

    closeAbout(): void {
        this.showAbout = false;
        this.cookieService.set("confirmation-about", "true");
    }

    openHelp(): void {
        console.log("open Aquatox help");
    }
}
