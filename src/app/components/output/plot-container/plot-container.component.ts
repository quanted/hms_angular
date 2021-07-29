import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as test from '../../../../base_jsons/response.json';

@Component({
  selector: 'app-plot-container',
  templateUrl: './plot-container.component.html',
  styleUrls: ['./plot-container.component.css']
})
export class PlotContainerComponent implements OnInit {

  data: any[];
  stateVariablesList: string[] = [];
  plotTitle: string;
  constructor() { }

  ngOnInit(): void {
    // Get the state variables
    this.stateVariablesList = Object.keys(test.data);
    this.plotTitle = this.stateVariablesList[0];
    const dates = [];
    test.dates.forEach(d => dates.push(new Date(d)));
    const values = [];
    test.data[this.stateVariablesList[0]].forEach(d => values.push(d));

    this.data = [];
    this.data.push({
      x: dates,
      y: values,
      type: 'scatter',
      name: this.stateVariablesList[0]
    });
  }

  dataChange(event) {
    const dates = [];
    test.dates.forEach(d => dates.push(new Date(d)));
    const values = [];
    test.data[this.plotTitle].forEach(d => values.push(d));

    this.data = [];
    this.data.push({
      x: dates,
      y: values,
      type: 'scatter',
      name: this.plotTitle
    });
  }
}
