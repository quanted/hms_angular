import { Component, OnInit } from "@angular/core";

import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { HmsService } from "src/app/services/hms.service";
import { MapService } from "src/app/services/map.service";
import { SimulationService } from "src/app/services/simulation.service";

@Component({
  selector: "app-input",
  templateUrl: "./input.component.html",
  styleUrls: ["./input.component.css"],
})
export class InputComponent implements OnInit {
  coordsForm: FormGroup;
  sourceForm: FormGroup;
  moduleForm: FormGroup;
  apiForm: FormGroup;
  endpointForm: FormGroup;

  atxModules = [
    "ANIMALS",
    "BIOACCUMULATION",
    "CHEMICALS",
    "DIAGENESIS",
    "ECOTOXICOLOGY",
    "NUTRIENTS",
    "ORGANICMATTER",
    "PLANTS",
    "STREAMHYDROLOGY",
  ];

  loadingApi = false;
  apiVersion;
  apiEndpointList = [];
  schemas;

  currentEndpoint;
  formInputs = [];

  waiting = false;

  responseList = [];

  constructor(
    private hms: HmsService,
    private fb: FormBuilder,
    private simulation: SimulationService,
    private mapService: MapService
  ) {}

  ngOnInit(): void {
    this.coordsForm = this.fb.group({
      lat: [null],
      lng: [null],
    });
    this.sourceForm = this.fb.group({
      source: [null],
      within: ["50"],
    });
    this.moduleForm = this.fb.group({
      moduleSelect: [null],
    });
    this.apiForm = this.fb.group({
      endpointSelect: [null],
    });

    this.loadingApi = true;
    this.hms.getApi().subscribe((api) => {
      this.apiVersion = api.version;
      this.apiEndpointList = api.apiEndpointList;
      this.schemas = api.schemas;
      this.loadingApi = false;
      this.updateEndpointForm();
    });
  }

  updateCoords(coords): void {
    this.coordsForm.setValue(coords);
  }

  getStream(): void {
    this.mapService
      .getStreamStart(this.coordsForm.value.lat, this.coordsForm.value.lng)
      .subscribe();
  }

  updateSelectedModule(): void {
    console.log("update module!");
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

  submitForm(): void {
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
      });
  }

  gotoData(endpoint) {
    console.log("click! ", endpoint);
  }
}
