import { Component } from '@angular/core';
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { SimulationService } from 'src/app/services/simulation.service';

@Component({
  selector: "app-output",
  templateUrl: "./output.component.html",
  styleUrls: ["./output.component.css"],
})
export class OutputComponent {
  // Array of drop list containers indexes
  items = [0];
  MAX_CONTAINERS = 6;

  // Importing SimulationService to keep data from url navigation
  constructor(private simulationService: SimulationService) { }

  drop(event: CdkDragDrop<any>) {
    // Swap indexes and items 
    this.items[event.previousContainer.data.index] = event.container.data.item;
    this.items[event.container.data.index] = event.previousContainer.data.item;
    // Trigger resize event to make plotly redraw
    window.dispatchEvent(new Event('resize'));
  }

  add() {
    // Check if we can add another item then add
    this.items.length < this.MAX_CONTAINERS && this.items.push(this.items.length);
    // Trigger resize event to make plotly redraw
    window.dispatchEvent(new Event('resize'));
  }

  delete(index: number) {
    // Delete item from array
    this.items.splice(index, 1);
    // Trigger resize event to make plotly redraw
    window.dispatchEvent(new Event('resize'));
  }
}
