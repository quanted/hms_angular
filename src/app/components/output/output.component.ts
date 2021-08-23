import { Component } from "@angular/core";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { SimulationService } from 'src/app/services/simulation.service';
import { CookieService } from 'ngx-cookie-service';
import { OutputService } from 'src/app/services/output.service';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-output",
  templateUrl: "./output.component.html",
  styleUrls: ["./output.component.css"]
})
export class OutputComponent {
  // Array of drop list containers indexes
  items: number[] = [];
  MAX_CONTAINERS = 6;

  // Array of drop list containers data.
  dropListData: any[];

  baseItem: any;

  constructor(
    // Importing SimulationService to keep data from url navigation
    private simulationService: SimulationService,
    private cookieService: CookieService,
    private outputService: OutputService,
    private route: ActivatedRoute
  ) {
    // Subscribe to service changes
    this.outputService.catchmentsSubject.subscribe(() => {
      this.baseItem = {
        selectedCatchments: [this.simulationService.simData.pour_point_comid
          ?? this.outputService.catchments.entries().next().value?.[0]],
        selectedSV: this.outputService.catchments.size > 0 &&
          Object.keys(this.outputService.catchments.entries().next().value?.[1].data)?.[0],
        selectedChart: "scatter"
      }
      // Check cookie service for output data
      if (this.cookieService.check("output") && this.cookieService.get("output") !== "undefined") {
        this.dropListData = JSON.parse(this.cookieService.get("output"));
      } else if (this.outputService.catchments.size > 0) {
        // Set drop list data
        this.dropListData = [
          {
            index: 0,
            item: this.baseItem
          }
        ];
        // Set cookie data
        this.cookieService.set("output", JSON.stringify(this.dropListData));
      }
      // Set containers 
      if (this.items.length === 0 && this.dropListData) {
        for (let i = 0; i < this.dropListData.length; i++) {
          this.items.push(i);
        }
      }
      this.outputService.stateVariablesList.length === 0 && this.outputService.setSVList();
    });

    // Update output cookie
    this.outputService.dropListDataSubject.subscribe(() => {
      this.cookieService.set("output", JSON.stringify(this.dropListData));
    });
  }

  ngOnInit() {

  }

  drop(event: CdkDragDrop<any>) {
    // Swap indexes and items
    console.log(event);
    this.items[event.previousContainer.data.index] = event.container.data.item;
    this.items[event.container.data.index] = event.previousContainer.data.item;
    console.log(event);
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
    this.dropListData.push({
      index: this.items.length - 1,
      item: this.baseItem
    });
    this.outputService.dropListDataSubject.next(this.dropListData);
    // Trigger resize event to make plotly redraw
    window.dispatchEvent(new Event("resize"));
  }

  delete(index: number) {
    console.log(this.dropListData);
    // Delete item from array
    for (let i = index; i < this.items.length - 1; i++) {
      // Move all items after the deleted one
      this.items[i] = this.items[i + 1];
      this.dropListData[i] = this.dropListData[i + 1];
    }
    // Delete last item
    this.items.pop();
    this.dropListData.pop();
    this.outputService.dropListDataSubject.next(this.dropListData);
    // Trigger resize event to make plotly redraw
    window.dispatchEvent(new Event("resize"));
  }
}
