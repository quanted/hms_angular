import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-expansion-panel-left",
  templateUrl: "./expansion-panel-left.component.html",
  styleUrls: ["./expansion-panel-left.component.css"],
})
export class ExpansionPanelLeftComponent {
  @Input() open: boolean;

  tooltipPosition = "right";

  constructor(
    public router: Router
  ) { }

  ngOnInit(): void {
  }

  openPanel(): void {
    this.open = true;
  }

  closePanel(): void {
    this.open = false;
  }
}
