import { Component, OnInit } from "@angular/core";
import { AboutComponent } from "../../main/about/about.component";

@Component({
    selector: "app-about-output",
    templateUrl: "./about-output.component.html",
    styleUrls: ["./about-output.component.css"],
})
export class AboutOutputComponent extends AboutComponent {
    constructor() {
        super();
    }
}
