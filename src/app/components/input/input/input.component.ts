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
    variableForm: FormGroup;
    pSetUpForm: FormGroup;
    pSetupAdvancedForm: FormGroup;
    localeForm: FormGroup;
    localeAdvancedForm: FormGroup;
    reminForm: FormGroup;
    reminAdvancedForm: FormGroup;
    uVarForm: FormGroup;
    svForm: FormGroup;

    waiting = false;
    simExecuting = false;
    simCompleted = false;

    huc;
    catchment;
    network = [];

    jsonFlags = [];
    baseJson = false;
    AQTModule = "none";
    separateNitrogen = false;
    variableFormValid = false;

    userAvailableVars = [];
    userSelectedVars = [];

    useFixStepSize = false;

    basicFields = null;
    advancedFields = null;

    showAdvanced = false;

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

        this.variableForm = this.fb.group({
            nType: ["separate"],
            pType: ["Total Soluble P"],
            orgType: ["Organic Matter"],
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
            fixStepSize: [this.simulation.getDefaultSolverStep(), Validators.required],
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

        const uVarFormFields = {};
        for (let field of this.userSelectedVars) {
            uVarFormFields[field.param] = [];
        }
        this.uVarForm = this.fb.group(uVarFormFields);

        this.simulation.interfaceData().subscribe((simData) => {
            this.updateInterface(simData);
        });
    }

    updateInterface(simData): void {
        this.waiting = simData.waiting;
        this.huc = simData.selectedHuc;
        this.catchment = simData.selectedCatchment;
        this.pSetUpForm.get("firstDay").setValue(this.simulation.getSimFirstDay());
        this.pSetUpForm.get("lastDay").setValue(this.simulation.getSimLastDay());
        this.userSelectedVars = simData.userAvailableVars;
        const uVarFormFields = {};
        for (let field of this.userSelectedVars) {
            uVarFormFields[field.param] = [];
        }
        this.uVarForm = this.fb.group(uVarFormFields);

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
            for (let variable of this.userSelectedVars) {
                for (let defaultParam of simData.base_json.AQTSeg.SV) {
                    if (variable.param == defaultParam.$type) {
                        if (defaultParam.InputRecord) {
                            this.uVarForm.get(variable.param).setValue(defaultParam.InputRecord.InitCond);
                        } else {
                            this.uVarForm.get(variable.param).setValue(defaultParam.InitialCond);
                        }
                    }
                }
            }
        }
        this.network = simData.network;
        if (simData.json_flags) {
            this.setAvailableSVs();
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
            this.simulation.buildStreamNetwork(
                this.simulation.getPourPoint(),
                this.aoiForm.get("distance").value,
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
        if (this.variableFormValid) {
            this.simulation.getBaseJsonByFlags(this.moduleForm.value, this.userAvailableVars);
        } else {
            console.log("error>>> at least one simulation option must be selected");
        }
    }

    setAvailableSVs(): void {
        this.variableFormValid = true;

        let nType = this.variableForm.get("nType").value;
        let pType = this.variableForm.get("pType").value;
        if (nType === "Total N" || pType === "Total P") this.moduleForm.get("Organic Matter").setValue(true);

        let form = this.moduleForm.value;

        // if Organic matter is selected nitrogen must be modeled
        const o = form["Organic Matter"];
        if (o) this.moduleForm.get("Nitrogen").setValue(true);

        const n = form["Nitrogen"];
        const p = form["Phosphorus"];

        if (n && !p && !o) this.AQTModule = "nitrogen";
        if (!n && p && !o) this.AQTModule = "phosphorus";
        if (n && p && !o) this.AQTModule = "nutrients";
        if (p && o) this.AQTModule = "organic";
        if (!p && o) this.AQTModule = "organic-nop";

        if (!n && !p && !o) this.AQTModule = "none";

        const varForm = this.variableForm.value;
        const availVars = [];
        if (this.AQTModule !== "none") {
            if (n) {
                if (nType == "Total N") {
                    availVars.push("Total N");
                } else {
                    availVars.push("Total Ammonia as N");
                    availVars.push("Nitrate as N");
                }
            }
            if (this.AQTModule == "phosphorus" || this.AQTModule == "nutrients" || this.AQTModule == "organic") {
                availVars.push(pType);
            }
            if (this.AQTModule == "organic" || this.AQTModule == "organic-nop") {
                availVars.push(varForm.orgType);
            }
        }
        this.userAvailableVars = availVars;

        if (this.AQTModule == "none") this.variableFormValid = false;
    }

    clearBaseJson(): void {
        this.simulation.clearBaseJson();
    }

    applyGlobalSettings(): void {
        if (this.pSetUpForm.valid && this.reminForm.valid && this.svForm.valid) {
            this.simulation.applyGlobalSettings({
                pSetup: this.pSetUpForm.value,
                remin: this.reminForm.value,
                uVars: this.uVarForm.value,
                sv: this.svForm.value,
            });
        }
    }

    toggleAltStep(): void {
        // the value of the form element here is what it WAS BEFORE the control was clicked
        this.pSetUpForm.get("useFixStepSize").value ? (this.useFixStepSize = false) : (this.useFixStepSize = true);
    }

    toggleAdvanced(): void {
        this.showAdvanced = !this.showAdvanced;
    }

    executeSimulation(): void {
        if (!this.simExecuting) {
            this.simulation.executeSimulation();
        }
    }

    returnToSetup(): void {
        this.simulation.returnToSetup();
    }

    resetSimulation(): void {
        this.simulation.resetSimulation();
    }
}
