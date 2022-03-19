import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
    selector: "app-output-panel",
    templateUrl: "./output-panel.component.html",
    styleUrls: ["./output-panel.component.css"],
})
export class OutputPanelComponent implements OnInit {
    panelTypes = ["Plot", "Table", "Segment List", "Map"];
    @Input() panelType;

    panelForm: FormGroup;

    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
        this.panelForm = this.fb.group({
            panelSelect: [this.panelType],
        });
    }

    // event from select element
    selectPanelType($event): void {
        this.setPanelType($event.target.value);
    }

    setPanelType(pType): void {
        this.panelType = pType;
        this.panelForm.get("panelSelect").setValue(pType);
    }
}
