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
  formInputs = [];

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
      // TODO this needs a lot of work to properly build a list of endpoints and parameters
      let requestType = swagger.paths[apiPath].hasOwnProperty('post')? 'post' : swagger.paths[apiPath].hasOwnProperty('get')? 'get' : 'null';
      let request = swagger.paths[apiPath];
      this.apiEndpointList.push({
        endpoint: apiPath,
        urlParts: apiPath.split('/').slice(1), 
        type: requestType,
        summary: request[requestType].summary,
        request: request[requestType]?.requestBody?.content['application/json']?.example
      });
    }
  }

  updateForm(): void {
    let endpoint = this.metForm.get('endpointSelect').value;
    this.formInputs = [];
    const formBuilderInputs = {};
    if (endpoint !== 'null') {
      // TODO this will also need a bunch of attention once a more complex endpoint list arrives
      for (let apiEndpoint of this.apiEndpointList) {
        if (this.metForm.get('endpointSelect').value == apiEndpoint.endpoint) {
          endpoint = apiEndpoint;
          for (let key of Object.keys(endpoint.request)) {
            this.formInputs.push(key);
            formBuilderInputs[key] = [null]
          }
        }
      }
    }
    this.endpointForm = this.fb.group(formBuilderInputs);
    this.currentEndpoint = endpoint !== 'null'? endpoint : null;
    console.log('endpoint: ', endpoint);
    console.log('schemas: ', this.schemas);
  }

  submitForm(): void {
    this.hms.submit({
      endpoint: this.currentEndpoint.endpoint,
      args: this.endpointForm.value
    });
  }
}
