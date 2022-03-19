import { Component, EventEmitter, OnInit, Output } from "@angular/core";

@Component({
    selector: "app-about",
    templateUrl: "./about.component.html",
    styleUrls: ["./about.component.css"],
})
export class AboutComponent {
    @Output() closeMe: EventEmitter<boolean> = new EventEmitter<boolean>();

    close(): void {
        this.closeMe.emit(true);
    }
}
