import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { OutputService } from 'src/app/services/output.service';

@Component({
  selector: 'app-output-panel-left',
  templateUrl: './output-panel-left.component.html',
  styleUrls: ['./output-panel-left.component.css']
})
export class OutputPanelLeftComponent implements OnInit {

  types: string[] = [];
  checkboxForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private outputService: OutputService
  ) {
    this.checkboxForm = this.formBuilder.group({
      boxes: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.types = this.outputService.types;
    const formArray = this.checkboxForm.get('boxes') as FormArray;
    this.types.forEach(x => formArray.push(new FormControl('')));
  }
}
