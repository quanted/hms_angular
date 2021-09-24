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
    aoiForm: FormGroup;
    moduleForm: FormGroup;
    pSetUpForm: FormGroup;
    pSetupAdvancedForm: FormGroup;
    localeForm: FormGroup;
    localeAdvancedForm: FormGroup;
    reminForm: FormGroup;
    reminAdvancedForm: FormGroup;
    svForm: FormGroup;

    waiting = false;
    simExecuting = false;
    simCompleted = false;

    huc;
    catchment;
    network = [];

    jsonFlags = [];
    baseJson = false;

    useFixStepSize = false;

    basicFields = null;
    advancedFields = null;

    showPSetupAdvanced = false;
    showLocaleAdvanced = false;
    showReminAdvanced = false;
    showSVAdvanced = false;

    sVariables;

    constructor(private fb: FormBuilder, private hms: HmsService, private simulation: SimulationService) {
        this.basicFields = this.simulation.getBasicFields();
        this.advancedFields = this.simulation.getAdvancedFields();
    }

    ngOnInit(): void {
        this.aoiForm = this.fb.group({
            pPointComid: [null],
            endComid: [{ value: null, disabled: true }],
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
            // simulationName is for the front end to use as a reference
            // to track user simulation in the browser cookie
            // it is NOT used by the Aquatox simulation
            simulationName: [null],

            firstDay: [this.simulation.getDefaultFirstDay(), Validators.required],
            lastDay: [this.simulation.getDefaultLastDay(), Validators.required],
            tStep: [this.simulation.getDefaultTimeStep(), Validators.required],
            useFixStepSize: [this.useFixStepSize],
            fixStepSize: [null],
        });

        // not being used
        this.localeForm = this.fb.group({});

        const reminFields = {};
        for (let field of this.basicFields.remin) {
            reminFields[field.param] = [];
        }
        this.reminForm = this.fb.group(reminFields);

        const svFields = {};
        for (let field of this.basicFields.sv) {
            svFields[field.param] = [];
        }
        this.svForm = this.fb.group(svFields);

        this.simulation.interfaceData().subscribe((simData) => {
            this.updateInterface(simData);
        });
    }

    updateInterface(simData): void {
        this.waiting = simData.waiting;
        this.huc = simData.selectedHuc;
        this.catchment = simData.selectedCatchment;
        if (simData.base_json) {
            const remin = simData.base_json.AQTSeg.Location.Remin;
            for (let variable of this.basicFields.remin) {
                this.reminForm.get(variable.param).setValue(remin[variable.param].Val);
            }
            for (let variable of this.basicFields.sv) {
                for (let defaultParam of simData.base_json.AQTSeg.SV) {
                    if (variable.param == defaultParam.$type) {
                        this.svForm.get(variable.param).setValue(defaultParam.InitialCond);
                    }
                }
            }
        }
        this.network = simData.network;
        if (simData.json_flags) {
            const moduleFormFields = {};
            for (let flag of this.jsonFlags) {
                moduleFormFields[flag] = [false];
                // select the first checkbox by default
                if (flag == this.jsonFlags[0]) {
                    moduleFormFields[flag] = [true];
                }
            }
            this.moduleForm = this.fb.group(moduleFormFields);
        }
        this.baseJson = simData.base_json;
        this.simExecuting = simData.sim_executing;
        this.simCompleted = simData.sim_completed;
    }

    getCatchment(): void {
        this.simulation.getCatchmentByComId(this.aoiForm.get("pPointComid").value);
    }

    getStreamNetwork(): void {
        if (this.aoiForm.get("endComid").value) {
            this.simulation.buildNetworkWithEndComid(
                this.simulation.getPourPoint(),
                this.aoiForm.get("endComid").value
            );
        } else {
            this.simulation.buildStreamNetwork(this.simulation.getPourPoint(), this.aoiForm.get("distance").value);
        }
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

    applyGlobalSettings(): void {
        if (this.pSetUpForm.valid && this.reminForm.valid && this.svForm.valid) {
            this.simulation.applyGlobalSettings({
                pSetup: this.pSetUpForm.value,
                remin: this.reminForm.value,
                sv: this.svForm.value,
            });
        }
    }

    toggleAltStep(): void {
        // the value of the form element here is what it WAS BEFORE the control was clicked
        this.pSetUpForm.get("useFixStepSize").value ? (this.useFixStepSize = false) : (this.useFixStepSize = true);
    }

    toggleAdvanced(section): void {
        switch (section) {
            case "pSetup":
                this.showPSetupAdvanced = !this.showPSetupAdvanced;
                break;
            case "locale":
                this.showLocaleAdvanced = !this.showLocaleAdvanced;
                break;
            case "remin":
                this.showReminAdvanced = !this.showReminAdvanced;
                break;
            case "sv":
                this.showSVAdvanced = !this.showSVAdvanced;
                break;
            default:
                return;
        }
    }

    executeSimulation(): void {
        if (!this.simExecuting) {
            this.simulation.executeSimulation();
        }
    }

    resetSimulation(): void {
        this.simulation.resetSimulation();
    }
}
