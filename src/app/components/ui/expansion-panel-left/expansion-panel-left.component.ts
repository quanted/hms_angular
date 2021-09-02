import { Component, Input } from "@angular/core";

@Component({
    selector: "app-expansion-panel-left",
    templateUrl: "./expansion-panel-left.component.html",
    styleUrls: ["./expansion-panel-left.component.css"],
})
export class ExpansionPanelLeftComponent {
    @Input() open: boolean;

    tooltipPosition = "right";

    constructor() {}

    ngOnInit(): void {}

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
        console.log("about Aquatox WebWorkflow");
    }

    openHelp(): void {
        console.log("open Aquatox help");
    }
}
