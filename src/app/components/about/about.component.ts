import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    selector: "app-about",
    templateUrl: "./about.component.html",
    styleUrls: ["./about.component.css"],
})
export class AboutComponent implements OnInit {
    @Output() closeMe: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(private router: Router) {}

    ngOnInit(): void {}

    close(): void {
        this.closeMe.emit(true);
    }
}
