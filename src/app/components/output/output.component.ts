import { OutputService } from "src/app/services/output.service";
import { Component, ElementRef, ViewChild } from "@angular/core";
import { CdkDragDrop } from "@angular/cdk/drag-drop";

export interface Tile {
  cols: number;
  rows: number;
}

@Component({
  selector: "app-output",
  templateUrl: "./output.component.html",
  styleUrls: ["./output.component.css"],
})
export class OutputComponent {
  items = [0];
  drop(event: CdkDragDrop<any>) {
    this.items[event.previousContainer.data.index] = event.container.data.item;
    this.items[event.container.data.index] = event.previousContainer.data.item;
  }
  add() {
    this.items.push(this.items.length);
  }
}
