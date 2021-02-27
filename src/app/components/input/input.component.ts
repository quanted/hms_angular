import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Module, AoI, Source, TimeZone, OutputDataFormat, TemporalResolution } from '../../models/forms.model' ;

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

  outputDataFormats: OutputDataFormat[] = [
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

  constructor(private fb: FormBuilder) { }
  @Output() requestSent: EventEmitter<any> = new EventEmitter<any>();
  
  ngOnInit(): void {
    this.inputForm = this.fb.group({
      module: [null, Validators.required],
      AoI: [null, Validators.required],
      lat: [null, Validators.required],
      lng: [null, Validators.required],
      catchmentID: ["22076143", Validators.required],
      stationID: ["GHCND:USW00013874", Validators.required],
      source: [null, Validators.required],
      startDate: [null, Validators.required],
      timeZone: [null, Validators.required],
      endDate: [null, Validators.required],
      outputFormat: [null, Validators.required],
      temporalResolution: [null, Validators.required],
      output: [""],
    })

    this.addOutput("Enter coordinates to goto location....");
    this.addOutput("Or click the map to select coordinates.");
  }

  mapClick($event) {
    this.addOutput('Map clicked at [' + $event.latlng.lat + ', ' + $event.latlng.lng + ']');
    this.inputForm.get('lat').setValue($event.latlng.lat);
    this.inputForm.get('lng').setValue($event.latlng.lng);
  }

  submit(): void {
    if (this.inputForm.valid) {
      this.addOutput("Valid input form, sending form to map...");
      this.addOutput(JSON.stringify(this.inputForm.value));
      const { module, AoI, lat, lng, catchmentID, stationID, source, startDate, timeZone, endDate, outputFormat, temporalResolution } = this.inputForm.value;
      const request = { module, AoI, lat, lng, catchmentID, stationID, source, startDate, timeZone, endDate, outputFormat, temporalResolution };
      this.requestSent.emit(request);
    } else {
      if (this.inputForm.get('lat').value && this.inputForm.get('lng').value) {  
        const lat = this.inputForm.get('lat').value;
        const lng = this.inputForm.get('lng').value;

        this.addOutput('Flying to [' + lat + ', ' + lng + ']...');
        this.requestSent.emit({ mapCoords: {
          lat, lng
        }});
      } else {
        this.addOutput('Invalid form! Please complete the required fields');
      }
    }
  }

  addOutput(message): void {
    this.inputForm.get('output').setValue(this.inputForm.get('output').value + "\n" + message);
    const outputArea = document.getElementById('output');
    outputArea.scrollTop = outputArea.scrollHeight;
  }
}