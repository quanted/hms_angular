import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-expansion-panel-right",
  templateUrl: "./expansion-panel-right.component.html",
  styleUrls: ["./expansion-panel-right.component.css"],
})
export class ExpansionPanelRightComponent implements OnInit {
  @Input() open: boolean;

  tooltipPosition = "left";

  constructor() {}

  ngOnInit(): void {}

  openPanel(): void {
    this.open = true;
  }

  closePanel(): void {
    this.open = false;
  }
}
