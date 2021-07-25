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

  openPanel(): void {
    this.open = true;
  }

  closePanel(): void {
    this.open = false;
  }
}
