import { Component, OnInit } from "@angular/core";

import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";

import { HmsService } from "src/app/services/hms.service";
import { MapService } from "src/app/services/map.service";
import { SimulationService } from "src/app/services/simulation.service";

@Component({
  selector: "app-input",
  templateUrl: "./input.component.html",
  styleUrls: ["./input.component.css"],
})
export class InputComponent implements OnInit {
  distanceForm: FormGroup;
  moduleForm: FormGroup;
  pPointForm: FormGroup;
  svForm: FormGroup;
  pSetUpForm: FormGroup;

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

  status_message = "";
  simulationExecuting = false;
  simComplete = false;

  apiVersion;
  apiEndpointList = [];
  schemas;

  currentEndpoint;
  formInputs = [];
  flags = [];

  waiting = false;

  responseList = [];

  /*
  Total N
  Total P
  Organic Matter

  Amonia
  Nitrate
  Total P
  Organic Matter

  Amonia
  Nitrate
  Phosphate- dissoved PO4
  Organic matter 

  Nitrogen
  Phosphorus
  Organic Matter

  Total N
  Dissolved Phosphate (PO4)
  Organic Matter

  "$type": "TNH4Obj", "PName": "Total Ammonia as N",
  "$type": "TNO3Obj", "PName": "Nitrate as N",
  "$type": "TPO4Obj", "PName": "Total Soluble P",
  "$type": "TCO2Obj", "PName": "Carbon dioxide",
  "$type": "TO2Obj", "PName": "Oxygen",
  */

  constructor(
    private router: Router,
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
    });

    this.pPointForm = this.fb.group({
      pPointComid: [null],
    });

    this.distanceForm = this.fb.group({
      distance: ["50"],
    });

    this.moduleForm = this.fb.group({});
    this.hms.getATXJsonFlags().subscribe((flags) => {
      this.jsonFlags = flags;
      const moduleFormFields = {};
      for (let flag of this.jsonFlags) {
        moduleFormFields[flag] = [false];
      }
      this.moduleForm = this.fb.group(moduleFormFields);
    });

    this.svForm = this.fb.group({
      totalN: [true],
      totalP: [true],
      nType: [null],
      pType: [null],
    });

    this.pSetUpForm = this.fb.group({
      firstDay: [null],
      lastDay: [null],
      stepSizeInDays: [null],
      useFixStepSize: [null],
      fixStepSize: [null],
    });

    this.simulation.interfaceData().subscribe((d) => {
      this.updateInterface(d);
    });
  }

  updateInterface(data): void {
    for (let key of Object.keys(data)) {
      switch (key) {
        case "huc":
          this.updateHucInput(data[key]);
          break;
        case "catchment":
          this.updateCatchmentInput(data[key]);
          break;
        case "status_message":
          this.status_message = data[key];
          break;
        case "sim_completed":
          if (data[key] === true) this.simulationExecuting = false;
          this.simComplete = data[key];
          break;
        default:
        // console.log("input doesn't use: ", key);
      }
    }
  }

  updateHucInput(huc): void {
    this.huc = huc;
  }

  clearHuc(): void {
    this.mapService.removeFeature("huc", this.huc.id);
    this.simulation.clearHuc();
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
    this.simulation.clearCatchment();
    this.catchment = null;
    this.stream = false;
  }

  getPourPoint(): void {
    console.log("pour point: ", this.pPointForm.get("pPointComid").value);
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
      this.simulation.updateSimData("base_json", json);
      this.baseJson = true;
    });
  }

  clearBaseJson(): void {
    this.baseJson = false;
    this.simulation.updateSimData("base_json", null);
  }

  isUsingFixedStep(): boolean {
    return this.pSetUpForm.get("useFixStepSize").value;
  }

  initSim(): void {
    this.simulation.initializeAquatoxSimulation();
  }

  addData(): void {
    this.simulation.addData();
  }

  executeSimulation(): void {
    this.simulationExecuting = true;
    this.simulation.executeSimulation();
  }

  cancelExecution(): void {
    this.simulationExecuting = false;
    this.simulation.cancelAquatoxSimulationExecution();
  }

  getSimStatus(): void {
    this.simulation.getStatus();
  }

  gotoOutput(): void {
    this.router.navigateByUrl("output");
  }

  downloadSimResults(): void {
    this.simulation.downloadSimResults();
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
