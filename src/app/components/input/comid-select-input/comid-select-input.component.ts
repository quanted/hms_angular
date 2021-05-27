import { Component, OnInit } from "@angular/core";
import { SimulationService } from "../../../services/simulation.service";
import { MapService } from "../../../services/map.service";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
  selector: "app-comid-select-input",
  templateUrl: "./comid-select-input.component.html",
  styleUrls: ["./comid-select-input.component.css"],
})
export class ComidSelectInputComponent implements OnInit {
  inputFormGroup: FormGroup;
  svIndex = []; /* Get from service */
  useConstLoadings = true;

  selectedComId = null;

  constructor(
    private fb: FormBuilder,
    private simulation: SimulationService,
    public mapService: MapService
  ) {}

  ngOnInit(): void {
    this.simulation.interfaceData().subscribe((data) => {
      for (let key of Object.keys(data)) {
        switch (key) {
          case "selectedComId":
            this.updateComId(data[key]);
        }
      }
    });

    this.inputFormGroup = this.fb.group({
      constLoading: [""],
      loadingMulti: [""],
      altLoadings: [""],
    });
  }

  updateComId(data): void {
    console.log("selectedComId: ", data);
    this.selectedComId = data.comid;
  }
}
