import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { HmsService } from 'src/app/services/hms.service';

@Component({
  selector: 'app-meteorology',
  templateUrl: './meteorology.component.html',
  styleUrls: ['./meteorology.component.css']
})
export class MeteorologyComponent implements OnInit {
  metForm: FormGroup;
  endpointForm: FormGroup;

  apiv;
  apiEndpointList = [];
  schemas;

  currentEndpoint;
  inputs = [];

  constructor(
    private hms: HmsService,
    private fb: FormBuilder
    ) {}

  ngOnInit(): void {
    this.currentEndpoint = null;
    this.metForm = this.fb.group({
      endpointSelect: [null],
    });
    // this.hms.getSwagger().subscribe((response) => {
    //   console.log('response: ', response);
    //   this.buildForm(response);
    // })

    this.buildEndpointList(this.hms.getOfflineSwagger());
  }

  buildEndpointList(swagger): void {
    this.apiv = swagger.openapi;
    this.schemas = swagger.components.schemas;

    this.apiEndpointList = [];
    for (let apiPath of Object.keys(swagger.paths)) {
      let requestType = swagger.paths[apiPath].hasOwnProperty('post')? 'post' : swagger.paths[apiPath].hasOwnProperty('get')? 'get' : 'null';
      let request = swagger.paths[apiPath];
      this.apiEndpointList.push({
        endpoint: apiPath,
        urlParts: apiPath.split('/').slice(1), 
        type: requestType,
        request: request[requestType] 
      });
    }
  }

  updateForm(): void {
    let endpoint = this.metForm.get('endpointSelect').value;
    this.inputs = [];
    const formInputs = {};
    if (endpoint !== 'null') {
      for (let ept of this.apiEndpointList) {
        if (this.metForm.get('endpointSelect').value == ept.endpoint) {
          endpoint = ept;
          const example = endpoint.request?.requestBody?.content['application/json']?.example;
          const exampleKeys = Object.keys(example);
          for (let key of exampleKeys) {
            this.inputs.push(key);
            formInputs[key] = [null] 
          }
        }
      }
    }
    this.endpointForm = this.fb.group(formInputs);
    this.currentEndpoint = endpoint !== 'null'? endpoint : null;
  }

  submitForm(): void {
    this.hms.submit({
      endpoint: this.currentEndpoint.endpoint,
      args: this.endpointForm.value
    });
  }
}