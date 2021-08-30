import { Component, OnDestroy, OnInit } from "@angular/core";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { SimulationService } from 'src/app/services/simulation.service';
import { CookieService } from 'ngx-cookie-service';
import { OutputService } from 'src/app/services/output.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ActivatedRoute } from "@angular/router";
import { HmsService } from "src/app/services/hms.service";

@Component({
  selector: "app-output",
  templateUrl: "./output.component.html",
  styleUrls: ["./output.component.css"]
})
export class OutputComponent implements OnInit, OnDestroy {

  catchments: any = {};
  comid: string;
  // Max number of containers
  MAX_CONTAINERS = 6;
  // Array of drop list containers data.
  dropListData: any[] = [];

  baseItem: any = {};

  constructor(
    // Importing SimulationService to keep data from url navigation
    private simulationService: SimulationService,
    private hmsService: HmsService,
    private cookieService: CookieService,
    private outputService: OutputService,
    private route: ActivatedRoute,
  ) {
    // Update output cookie everytime droplist data changes
    this.outputService.dropListDataSubject.subscribe((data) => {
      this.cookieService.set("output", JSON.stringify(this.dropListData));
    });
  }

  ngOnInit() {
    // First, check for comid in url
    if (this.route.snapshot.paramMap.has("comid")) {
      this.comid = this.route.snapshot.paramMap.get("comid");
      // Set grid of containers
      this.dropListData.push({
        selectedCatchments: [this.comid],
        selectedTableCatchment: this.comid,
        selectedSV: 0,
        selectedChart: "scatter"
      }, {
        selectedCatchments: [this.comid],
        selectedTableCatchment: this.comid,
        selectedSV: 1,
        selectedChart: "scatter"
      }, {
        selectedCatchments: [this.comid],
        selectedTableCatchment: this.comid,
        selectedSV: 2,
        selectedChart: "scatter"
      }, {
        selectedCatchments: [this.comid],
        selectedTableCatchment: this.comid,
        selectedSV: 3,
        selectedChart: "scatter"
      }, {
        selectedCatchments: [this.comid],
        selectedTableCatchment: this.comid,
        selectedSV: 0,
        selectedChart: "table"
      });
      // Get catchment data by getting the taskid from the sim status
      this.hmsService
        .getAquatoxSimStatus(this.cookieService.get("simId"))
        .subscribe((response) => {
          if (Object.keys(response.catchments).includes(this.comid)) {
            // Make request to retrieve catchment data and place in variable
            this.hmsService
              .getCatchmentData(response.catchments[this.comid].task_id)
              .subscribe((data) => {
                // Put all state variables into output state variables list
                this.outputService.stateVariablesList = Object.keys(data.data);
                // Set grid of containers
                this.dropListData = [];
                this.dropListData.push({
                  selectedCatchments: [this.comid],
                  selectedTableCatchment: this.comid,
                  selectedSV: 0,
                  selectedChart: "scatter"
                }, {
                  selectedCatchments: [this.comid],
                  selectedTableCatchment: this.comid,
                  selectedSV: 1,
                  selectedChart: "scatter"
                }, {
                  selectedCatchments: [this.comid],
                  selectedTableCatchment: this.comid,
                  selectedSV: 2,
                  selectedChart: "scatter"
                }, {
                  selectedCatchments: [this.comid],
                  selectedTableCatchment: this.comid,
                  selectedSV: 3,
                  selectedChart: "scatter"
                }, {
                  selectedCatchments: [this.comid],
                  selectedTableCatchment: this.comid,
                  selectedSV: 0,
                  selectedChart: "table"
                });
                // Update cookie 
                this.outputService.dropListDataSubject.next(this.dropListData);
                // Callback
                this.simulationService.updateSimData("catchment_data",
                  { comid: this.comid, data: data });
              });
          }
        });
    }
  }

  ngOnDestroy(): void {
    if (this.cookieService.check("output")) {
      this.cookieService.delete("output");
    }
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
      this.dropListData.push({
        selectedCatchments: [this.comid],
        selectedTableCatchment: this.comid,
        selectedSV: 0,
        selectedChart: "scatter"
      });
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
