import { Component, OnInit } from "@angular/core";

import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { HmsService } from "src/app/services/hms.service";
import { SimulationService } from "src/app/services/simulation.service";
import { LayerService } from "src/app/services/layer.service";

@Component({
    selector: "app-input",
    templateUrl: "./input.component.html",
    styleUrls: ["./input.component.css"],
})
export class InputComponent implements OnInit {
    distanceForm: FormGroup;
    moduleForm: FormGroup;
    pPointForm: FormGroup;
    pSetUpForm: FormGroup;
    pSetupAdvancedForm: FormGroup;
    localeForm: FormGroup;
    localeAdvancedForm: FormGroup;
    reminForm: FormGroup;
    reminAdvancedForm: FormGroup;
    svForm: FormGroup;

    basicPSetupFields = ["FirstDay", "LastDay", "UseFixStepSize", "FixStepSize", "StepSizeInDays"];

    // these are one that were discussed being exposed to the user
    // but they seem like advanced would be more appropriate?
    // "SaveBRates", // save derivative rates false to save space
    // "AverageOutput", // trapiziodal integration

    basicLocaleFields = ["no basic parameters"];

    basicReminFields = [
        { param: "DecayMax_Lab" },
        { param: "DecayMax_Refr" },
        { param: "KNitri" },
        { param: "KDenitri_Wat" },
    ];

    waiting = false;
    simExecuting = false;
    simCompleted = false;

    sv = [];
    network = [];

    jsonFlags = [];
    baseJson = false;

    sVariables;
    numNetSegments;
    huc;
    catchment;

    constructor(
        private fb: FormBuilder,
        private hms: HmsService,
        private simulation: SimulationService,
        private layerService: LayerService
    ) {}

    ngOnInit(): void {
        this.pPointForm = this.fb.group({
            pPointComid: [null],
        });

        this.distanceForm = this.fb.group({
            distance: [this.simulation.getUpstreamDistance()],
        });

        this.moduleForm = this.fb.group({});
        this.hms.getATXJsonFlags().subscribe((flags) => {
            this.jsonFlags = flags;
            const moduleFormFields = {};
            for (let flag of this.jsonFlags) {
                moduleFormFields[flag] = [false];
                // select the first checkbox by default
                if (flag == this.jsonFlags[0]) {
                    moduleFormFields[flag] = [true];
                }
            }
            this.moduleForm = this.fb.group(moduleFormFields);
        });

        this.pSetUpForm = this.fb.group({
            firstDay: [this.simulation.getFirstDay(), Validators.required],
            lastDay: [this.simulation.getLastDay(), Validators.required],
            tStep: [this.simulation.getTimeStep(), Validators.required],
            useFixStepSize: [null],
            fixStepSize: [null],
        });

        this.localeForm = this.fb.group({});

        this.reminForm = this.fb.group({
            DecayMax_Lab: [],
            DecayMax_Refr: [],
            KNitri: [],
            KDenitri_Wat: [],
        });

        this.simulation.interfaceData().subscribe((data) => {
            this.updateInterface(data);
        });
    }

    // updateInterface(simData): void {
    //     console.log("interfaceUpdate: ", simData);
    //     this.waiting = simData.waiting;
    //     this.selectedHuc = simData.selectedHuc;
    //     this.selectedCatchment = simData.selectedCatchment;
    //     this.baseJson = simData.base_json;
    //     this.sv = simData.sv;
    //     this.network = simData.network;
    //     this.jsonFlags = simData.jsonFlags;
    //     this.baseJson = simData.base_json;
    //     this.simExecuting = simData.sim_executing;
    //     this.simCompleted = simData.sim_completed;
    // }

    updateInterface(data): void {
        for (let key of Object.keys(data)) {
            switch (key) {
                case "waiting":
                    this.waiting = data[key];
                    break;
                case "selectedHuc":
                    this.huc = data[key];
                    break;
                case "selectedCatchment":
                    this.catchment = data[key];
                    break;
                case "network":
                    this.network = data[key];
                    break;
                case "base_json":
                    this.baseJson = data[key];
                    break;
                case "sv":
                    this.sVariables = data[key];
                    break;
                case "sim_executing":
                    this.simExecuting = data[key];
                    break;
                case "sim_completed":
                    this.simCompleted = data[key];
                    break;
                default:
                // console.log("input doesn't use: ", key);
            }
        }
    }

    getCatchment(): void {
        this.layerService.getCatchmentByComId(this.pPointForm.get("pPointComid").value);
    }

    getStreamNetwork(): void {
        this.layerService.buildStreamNetwork(this.simulation.getPourPoint(), this.distanceForm.get("distance").value);
    }

    clearHuc(): void {
        this.layerService.removeFeature("huc");
    }

    clearCatchment(): void {
        this.layerService.removeFeature("catchment");
    }

    getBaseJSONByFlags(): void {
        this.simulation.getBaseJsonByFlags(this.moduleForm.value);
    }

    clearBaseJson(): void {
        this.simulation.updateSimData("base_json", null);
    }

    executeSimulation(): void {
        this.simulation.executeSimulation(this.pSetUpForm.value);
    }
}
