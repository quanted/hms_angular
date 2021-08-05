import { Component } from '@angular/core';
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { SimulationService } from 'src/app/services/simulation.service';

@Component({
  selector: "app-output",
  templateUrl: "./output.component.html",
  styleUrls: ["./output.component.css"],
})
export class OutputComponent {

  items = [0];
  MAX_CONTAINERS = 6;
  constructor(private simulationService: SimulationService) {
    console.log(this.simulationService.simData);
  }

  drop(event: CdkDragDrop<any>) {
    this.items[event.previousContainer.data.index] = event.container.data.item;
    this.items[event.container.data.index] = event.previousContainer.data.item;
    // Trigger resize event to make plotly redraw
    window.dispatchEvent(new Event('resize'));
  }

  add() {
    this.items.length < this.MAX_CONTAINERS && this.items.push(this.items.length);
    // Trigger resize event to make plotly redraw
    window.dispatchEvent(new Event('resize'));
  }
}
