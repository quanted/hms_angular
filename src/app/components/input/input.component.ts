import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Module, AoI, Source, TimeZone, DataValueFormat, TemporalResolution } from '../../models/forms.model' ;

import { InputService } from "../../services/input.service"

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements OnInit {
  modules: Module[] = [
    {value: 'Precipitation', viewValue: 'Precipitation'},
    {value: 'Air_Temperature', viewValue: 'Air Temperature'},
    {value: 'Relative_Humidity', viewValue: 'Relative Humidity'}
  ];

  interestAreas: AoI[] = [
    {value: 'comid', viewValue: 'COMID'},
    {value: 'lat/lon', viewValue: 'Lat/Lon'},
    {value: 'stationID', viewValue: 'Ncei Station ID'}
  ];

  sources: Source[] = [
    {value: 'nldas', viewValue: 'NLDAS'},
    {value: 'gldas', viewValue: 'GLDAS'},
    {value: 'trmm', viewValue: 'TRMM'}
  ];

  dataValueFormats: DataValueFormat[] = [
    {value: 'E', viewValue: 'E'},
  ];

  timeZones: TimeZone[] = [
    {value: 'Local', viewValue: 'Local'},
    {value: 'GMT', viewValue: 'GMT'},
  ];

  temporalResolutions: TemporalResolution[] = [
    {value: 'hourly', viewValue: 'Hourly'},
    {value: 'daily', viewValue: 'Daily'},
    {value: 'monthly', viewValue: 'Monthly'}
  ];

  inputForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private inputService: InputService
  ) { }
  @Output() requestSent: EventEmitter<any> = new EventEmitter<any>();
  buttonState = "Form incomplete"
  
  ngOnInit(): void {
    this.inputForm = this.fb.group({
      module: [null, Validators.required],
      AoI: [null, Validators.required],
      lat: [null, Validators.required],
      lng: [null, Validators.required],
      catchmentID: [null],
      stationID: [null],
      source: [null, Validators.required],
      startDate: [null, Validators.required],
      timeZone: [null, Validators.required],
      endDate: [null, Validators.required],
      dataValueFormat: [null, Validators.required],
      temporalResolution: [null, Validators.required],
      output: [''],
    });
    this.addOutput('Welcome to HMS web...');
    this.addOutput('Click the map to enter coords.');
  }

  mapClick($event) {
    this.addOutput('Map clicked at [' + $event.latlng.lat + ', ' + $event.latlng.lng + ']');
    this.inputForm.get('lat').setValue($event.latlng.lat);
    this.inputForm.get('lng').setValue($event.latlng.lng);
  }

  reset(): void {
    this.inputForm.reset();
    this.addOutput('Form reset');
  }

  flyTo(): void {
    if (this.inputForm.get('lat').value && this.inputForm.get('lng').value) {  
      const lat = this.inputForm.get('lat').value;
      const lng = this.inputForm.get('lng').value;

      this.addOutput('Flying to [' + lat + ', ' + lng + ']...');
      this.requestSent.emit({ mapCoords: {
        lat, lng
      }});
    } else {
      this.addOutput('Invalid coords! Click the map to enter coords, or enter them manually.');
    }
  }

  submit(): void {
    if (this.inputForm.valid) {
      this.addOutput("Valid input form, sending form to map...");
      this.addOutput(JSON.stringify(this.inputForm.value));
      const { module, AoI, lat, lng, catchmentID, stationID, source, startDate, timezone, endDate, dataValueFormat, temporalResolution } = this.inputForm.value;
      const dateTimeFormat = "yyyy-MM-dd HH"
      const dateTimeSpan = { startDate, endDate, dateTimeFormat };
      // Change the description below. Temporarily set to 'null' to get lat/lng.
      const description = null;
      const comID = null;
      const hucID = null;
      const latitude = lat;
      const longitude = lng;
      const geometryMetadata = null;
      const timeLocalized = null;
      const units = "metric";
      const outputFormat = "json";
      const baseURL = null; 
      const inputTimeSeries = null;
      const point = { latitude, longitude }
      const geometry = { description, comID, hucID, stationID, point, geometryMetadata }
      const request = { source, dateTimeSpan, geometry, dataValueFormat, temporalResolution, timeLocalized, outputFormat, units, baseURL, inputTimeSeries };
      this.sendRequest(module, request)
      this.requestSent.emit(request);
    } else {
      this.addOutput('Invalid form! Please complete the required fields.');
    }
  }

  sendRequest(module, request) {
    if (this.inputForm.valid) {
      this.inputService
        .getData(module, request)
        .subscribe((result) => {
          console.log(result);
        });
    } else {
      alert("Form is invalid")
      return;
    }
  }

  addOutput(message): void {
    let outputText = this.inputForm.get('output').value;
    if(!outputText) {
      outputText = '';
    }
    this.inputForm.get('output').setValue(outputText + "\n" + message);
    // stay on the bottom of text area
    const outputArea = document.getElementById('output');
    outputArea.scrollTop = outputArea.scrollHeight;
  }
}