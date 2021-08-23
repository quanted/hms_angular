import { Component } from "@angular/core";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { SimulationService } from "src/app/services/simulation.service";

@Component({
  selector: "app-output",
  templateUrl: "./output.component.html",
  styleUrls: ["./output.component.css"],
})
export class OutputComponent {
  // Array of drop list containers indexes
  items = [0, 1, 2, 3, 4];
  MAX_CONTAINERS = 6;

  // Importing SimulationService to keep data from url navigation
  constructor(private simulationService: SimulationService) {}

  drop(event: CdkDragDrop<any>) {
    // Swap indexes and items
    this.items[event.previousContainer.data.index] = event.container.data.item;
    this.items[event.container.data.index] = event.previousContainer.data.item;
    // Trigger resize event to make plotly redraw
    window.dispatchEvent(new Event("resize"));
  }

  add() {
    // Check if we can add another item
    if (this.items.length < this.MAX_CONTAINERS && this.items.length > 0) {
      this.items.push(Math.max(...this.items) + 1);
    } else if (this.items.length === 0) {
      this.items.push(0);
    }
    // Trigger resize event to make plotly redraw
    window.dispatchEvent(new Event("resize"));
  }

  delete(index: number) {
    // Delete item from array
    for (let i = index; i < this.items.length - 1; i++) {
      // Move all items after the deleted one
      this.items[i] = this.items[i + 1];
    }
    // Delete last item
    this.items.pop();
    // Trigger resize event to make plotly redraw
    window.dispatchEvent(new Event("resize"));
  }
}
