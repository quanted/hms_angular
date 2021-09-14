import { Component, OnInit } from "@angular/core";

import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { HmsService } from "src/app/services/hms.service";
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
    pSetUpForm: FormGroup;
    pSetupAdvancedForm: FormGroup;
    localeForm: FormGroup;
    localeAdvancedForm: FormGroup;
    reminForm: FormGroup;
    reminAdvancedForm: FormGroup;
    svForm: FormGroup;

    basicPSetupFields = [
        {
            param: "FirstDay",
            displayName: "First Day",
        },
        {
            param: "LastDay",
            displayName: "Last Day",
        },
        {
            param: "UseFixStepSize",
            displayName: "Use Fixed Step Size",
        },
        {
            param: "FixStepSize",
            displayName: "Fixed Step Size",
        },
        {
            param: "StepSizeInDays",
            displayName: "Step Size in Days",
        },
        {
            param: "SaveBRates", // save derivative rates false to save space
            displayName: "Save Derivitive Rates",
        },
        {
            param: "AverageOutput", // trapiziodal integration
            displayName: "Average Output",
        },
    ];

    basicLocaleFields = [{ param: "SiteName", displayName: "Site Name" }];

    basicReminFields = [
        {
            param: "DecayMax_Lab",
            displayName: "Decay Max Lab",
        },
        {
            param: "DecayMax_Refr",
            displayName: "Decay Max Refr",
        },
        {
            param: "KNitri",
            displayName: "K Nitri",
        },
        {
            param: "KDenitri_Wat",
            displayName: "K Denitri - Water",
        },
    ];

    waiting = false;
    simExecuting = false;
    simCompleted = false;

    huc;
    catchment;
    network = [];

    jsonFlags = [];
    baseJson = false;

    sVariables;

    constructor(private fb: FormBuilder, private hms: HmsService, private simulation: SimulationService) {}

    ngOnInit(): void {
        this.pPointForm = this.fb.group({
            pPointComid: [null],
        });

        this.distanceForm = this.fb.group({
            distance: [this.simulation.getDefaultUpstreamDistance()],
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
            firstDay: [this.simulation.getDefaultFirstDay(), Validators.required],
            lastDay: [this.simulation.getDefaultLastDay(), Validators.required],
            tStep: [this.simulation.getDefaultTimeStep(), Validators.required],
            useFixStepSize: [null],
            fixStepSize: [null],
        });

        this.localeForm = this.fb.group({
            SiteName: [""],
        });

        this.reminForm = this.fb.group({
            DecayMax_Lab: [],
            DecayMax_Refr: [],
            KNitri: [],
            KDenitri_Wat: [],
        });

        this.simulation.interfaceData().subscribe((simData) => {
            this.updateInterface(simData);
        });
    }

    updateInterface(simData): void {
        this.waiting = simData.waiting;
        this.huc = simData.selectedHuc;
        this.catchment = simData.selectedCatchment;
        this.baseJson = simData.base_json;
        this.sVariables = simData.sv;
        this.network = simData.network;
        this.baseJson = simData.base_json;
        this.simExecuting = simData.sim_executing;
        this.simCompleted = simData.sim_completed;
    }

    getCatchment(): void {
        this.simulation.getCatchmentByComId(this.pPointForm.get("pPointComid").value);
    }

    getStreamNetwork(): void {
        this.simulation.buildStreamNetwork(this.simulation.getPourPoint(), this.distanceForm.get("distance").value);
    }

    clearHuc(): void {
        this.simulation.clearHuc();
    }

    clearCatchment(): void {
        this.simulation.clearCatchment();
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

    resetSimulation(): void {
        this.simulation.resetSimulation();
    }
}
