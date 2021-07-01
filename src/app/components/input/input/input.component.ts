import { Component, OnInit } from "@angular/core";

import { FormBuilder, FormGroup } from "@angular/forms";

import { HmsService } from "src/app/services/hms.service";
import { MapService } from "src/app/services/map.service";
import { SimulationService } from "src/app/services/simulation.service";

@Component({
  selector: "app-input",
  templateUrl: "./input.component.html",
  styleUrls: ["./input.component.css"],
})
export class InputComponent implements OnInit {
  aoiForm: FormGroup;
  distanceForm: FormGroup;
  sourceForm: FormGroup;
  moduleForm: FormGroup;
  apiForm: FormGroup;
  endpointForm: FormGroup;

  huc: HUC;
  catchment: Catchment;
  stream = false;

  // probably change this to a single state variable and a loading spinner on map
  // instead of this per button progress bar approach
  loadingHuc = false;
  loadingCatchment = false;
  loadingStream = false;
  loadingApi = false;

  jsonFlags = null;
  baseJson = false;

  // TODO: implement call to execution check endpoint
  executionReady = true;

  apiVersion;
  apiEndpointList = [];
  schemas;

  currentEndpoint;
  selectedFile;
  uploadedFile;
  formInputs = [];
  flags = [];

  waiting = false;

  responseList = [];

  constructor(
    private hms: HmsService,
    private fb: FormBuilder,
    private simulation: SimulationService,
    public mapService: MapService
  ) {}

  ngOnInit(): void {
    this.loadingApi = true;
    this.hms.getApi().subscribe((api) => {
      this.apiVersion = api.version;
      this.apiEndpointList = api.apiEndpointList;
      this.schemas = api.schemas;
      this.loadingApi = false;
      this.updateEndpointForm();
    });

    this.aoiForm = this.fb.group({
      lat: [null],
      lng: [null],
    });
    this.distanceForm = this.fb.group({
      distance: ["50"],
    });
    this.sourceForm = this.fb.group({
      source: [null],
      within: ["50"],
    });
    this.apiForm = this.fb.group({
      endpointSelect: [null],
    });
    this.simulation.interfaceData().subscribe((d) => {
      this.updateInterface(d);
    });

    this.moduleForm = this.fb.group({});
    this.hms.getATXJsonFlags().subscribe((flags) => {
      this.jsonFlags = flags;
      const moduleFormFlags = {};
      for (let flag of this.jsonFlags) {
        moduleFormFlags[flag] = [false];
      }
      this.moduleForm = this.fb.group(moduleFormFlags);
    });
  }

  updateInterface(data): void {
    for (let key of Object.keys(data)) {
      switch (key) {
        case "coords":
          this.aoiForm.setValue(data[key]);
          break;
        case "huc":
          this.updateHucInput(data[key]);
          break;
        case "catchment":
          this.updateCatchmentInput(data[key]);
          break;
        default:
        // console.log("unknown key: ", key);
      }
    }
  }

  updateCoordsInput(coords): void {
    this.aoiForm.setValue(coords);
  }

  updateHucInput(huc): void {
    this.huc = huc;
  }

  clearHuc(): void {
    this.mapService.removeFeature("huc", this.huc.id);
    this.simulation.updateSimData("huc", null);
    this.huc = null;
    if (this.catchment) {
      this.clearCatchment();
    }
  }

  updateCatchmentInput(catchment): void {
    this.catchment = catchment;
  }

  clearCatchment(): void {
    this.mapService.removeFeature("catchment", this.catchment.id);
    this.simulation.updateSimData("catchment", null);
    this.catchment = null;
    this.stream = false;
  }

  getStreamNetwork(): void {
    this.loadingStream = true;
    this.mapService
      .buildStreamNetwork(
        this.catchment.id,
        this.distanceForm.get("distance").value
      )
      .subscribe((data) => {
        this.loadingStream = false;
        if (data) this.stream = true;
      });
  }

  getBaseJSONByFlags(): void {
    const flags = this.moduleForm.value;
    this.simulation.updateSimData("flags", flags);
    this.hms.getBaseJsonByFlags(flags).subscribe((json) => {
      this.simulation.updateSimData("base-json", json);
      this.baseJson = true;
    });
  }

  clearBaseJson(): void {
    this.baseJson = false;
    this.simulation.updateSimData("base-json", null);
  }

  executeSimulation(): void {
    console.log("execute simulation!");
    this.simulation.executeSimulation();
  }

  updateEndpointForm(): void {
    let endpoint = this.apiForm.get("endpointSelect").value;
    this.formInputs = [];
    const formBuilderInputs = {};
    if (endpoint !== null && endpoint !== "null") {
      // TODO this will also need a bunch of attention once a more complex endpoint list arrives
      for (let apiEndpoint of this.apiEndpointList) {
        if (this.apiForm.get("endpointSelect").value == apiEndpoint.endpoint) {
          endpoint = apiEndpoint;
          for (let key of Object.keys(endpoint.request)) {
            this.formInputs.push(key);
            formBuilderInputs[key] = [null];
          }
        }
      }
      this.endpointForm = this.fb.group(formBuilderInputs);
      this.endpointForm.setValue(endpoint.request);
    }
    this.currentEndpoint = endpoint !== "null" ? endpoint : null;
  }

  submitHMSDataRequest(): void {
    this.waiting = true;
    this.hms
      .submit({
        type: this.currentEndpoint.type,
        endpoint: this.currentEndpoint.endpoint,
        args: this.endpointForm.value,
      })
      .subscribe((response) => {
        this.waiting = false;
        this.simulation.updateData(this.currentEndpoint.endpoint, response);
        this.responseList = this.simulation.getResponseList();
        console.log("list: ", this.responseList);
        console.log("response: ", response);
      });
  }

  // navigate to data browsing page loading the selected dataset
  gotoData(endpoint) {
    console.log("click! ", endpoint);
  }
}

interface HUC {
  areaAcres: string;
  areaSqKm: string;
  id: string;
  name: string;
}

interface Catchment {
  areaSqKm: string;
  id: string;
}
