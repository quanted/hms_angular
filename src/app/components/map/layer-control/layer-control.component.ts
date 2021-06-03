import { Component, OnInit, Input } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { LayerService } from "src/app/services/layer.service";

@Component({
  selector: "app-layer-control",
  templateUrl: "./layer-control.component.html",
  styleUrls: ["./layer-control.component.css"],
})
export class LayerControlComponent implements OnInit {
  @Input() feature;

  controlOpen = false;

  styleForm = this.fb.group({
    color: [null],
    weight: [null],
    fillColor: [null],
    fillOpacity: [null],
  });

  constructor(private fb: FormBuilder, private layerService: LayerService) {}

  ngOnInit(): void {
    if (this.feature.type == "simfeature-line") {
      this.styleForm = this.fb.group({
        color: [null],
        weight: [null],
      });
    }
    this.styleForm.setValue(this.feature.layer.options.style);
  }

  toggleLayer(): void {
    this.layerService.toggleLayer(this.feature.type, this.feature.name);
  }

  updateStyle(type): void {
    switch (type) {
      case "feature":
      case "simfeature":
        this.layerService.updateStyle(this.feature.name, {
          color: this.styleForm.get("color").value,
          weight: this.styleForm.get("weight").value,
          fillColor: this.styleForm.get("fillColor").value,
          fillOpacity: this.styleForm.get("fillOpacity").value,
        });
        break;
      case "simfeature-line":
        this.layerService.updateStyle(this.feature.name, {
          color: this.styleForm.get("color").value,
          weight: this.styleForm.get("weight").value,
        });
        break;
    }
  }

  toggleControl(): void {
    this.controlOpen = !this.controlOpen;
  }
}
