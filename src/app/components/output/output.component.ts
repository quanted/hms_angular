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
  MAX_CONTAINERS = 6;

  // Array of drop list containers data.
  dropListData: any[] = [];

  baseItem: any = {};

  constructor(
    // Importing SimulationService to keep data from url navigation
    private simulationService: SimulationService,
    private cookieService: CookieService,
    private outputService: OutputService,
    private route: ActivatedRoute
  ) {
    // Subscribe to catchment changes
    this.outputService.catchmentsSubject.subscribe(() => {
      const catchmentFromURL = this.route.snapshot.paramMap.get("comid");

      if (catchmentFromURL) {
        this.baseItem.selectedCatchments = [catchmentFromURL, this.simulationService.simData.pour_point_comid
          ?? this.outputService.catchments.entries().next().value?.[0] ?? ""];
      } else {
        this.baseItem.selectedCatchments = [this.simulationService.simData.pour_point_comid
          ?? this.outputService.catchments.entries().next().value?.[0] ?? ""];
      }

      if (this.outputService.catchments.size > 0) {
        this.baseItem.selectedSV = Object.keys(this.outputService.catchments.entries().next().value?.[1].data)?.[0] ?? "";
      } else {
        this.baseItem.selectedSV = "";
      }
      this.baseItem.selectedChart = "scatter";
      console.log(this.baseItem);
      // Check cookie service for output data
      if (this.cookieService.check("output") && this.cookieService.get("output") !== "undefined" && this.outputService.catchments.size < 1) {
        this.dropListData = JSON.parse(this.cookieService.get("output"));
      } else if (this.outputService.catchments.size > 0) {
        // Set drop list data
        this.dropListData = [
          { ...this.baseItem }
        ];
        // Set cookie data
        this.cookieService.set("output", JSON.stringify(this.dropListData));
      }
      // Set containers 
      if (this.dropListData.length === 0 && this.dropListData) {
        for (let i = 0; i < this.dropListData.length; i++) {
          this.dropListData.push(i);
        }
      }
      this.outputService.stateVariablesList.length === 0 && this.outputService.setSVList();
    });

    // Update output cookie
    this.outputService.dropListDataSubject.subscribe((data) => {
      console.log(this.dropListData);
      this.cookieService.set("output", JSON.stringify(this.dropListData));
    });
  }

  ngOnInit() {

  }

  drop(event: CdkDragDrop<any>) {
    // Swap indexes and items
    this.dropListData[event.previousContainer.data.index] = event.container.data.item;
    this.dropListData[event.container.data.index] = event.previousContainer.data.item;
    // Droplist changed, update cookie
    this.outputService.dropListDataSubject.next(this.dropListData);
    // Trigger resize event to make plotly redraw
    window.dispatchEvent(new Event("resize"));
  }

  add() {
    // Check if we can add another item
    if (this.dropListData.length < this.MAX_CONTAINERS) {
      this.dropListData.push({ ...this.baseItem });
    }
    // Droplist changed, update cookie
    this.outputService.dropListDataSubject.next(this.dropListData);
    // Trigger resize event to make plotly redraw
    window.dispatchEvent(new Event("resize"));
  }

  delete(index: number) {
    // Delete item from array
    for (let i = index; i < this.dropListData.length - 1; i++) {
      // Move all dropListData after the deleted one
      this.dropListData[i] = this.dropListData[i + 1];
    }
    // Delete last item
    this.dropListData.pop();
    // Droplist changed, update cookie
    this.outputService.dropListDataSubject.next(this.dropListData);
    // Trigger resize event to make plotly redraw
    window.dispatchEvent(new Event("resize"));
  }
}
