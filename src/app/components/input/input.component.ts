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
      aoI: [null, Validators.required],
      lat: ["33.925575", Validators.required],
      lng: ["83.356893", Validators.required],
      catchmentID: ["22076143", Validators.required],
      stationID: ["GHCND:USW00013874", Validators.required],
      source: [null, Validators.required],
      startDate: ["2015-01-01", Validators.required],
      timeZone: [null, Validators.required],
      endDate: ["2015-01-31", Validators.required],
      outputFormat: [null, Validators.required],
      temporalResolution: [null, Validators.required],
      output: [null],
    })
  }

  mapClick($event) {
    this.inputForm.get('lat').setValue($event.latlng.lat);
    this.inputForm.get('lng').setValue($event.latlng.lng);
  }

  submit(): void {
    if (this.inputForm.valid) {
      this.inputForm.get('output').setValue(JSON.stringify(this.inputForm.value));
      this.requestSent.emit(this.inputForm.value);
    } else {
      this.inputForm.get('output').setValue('Invalid form! Please complete the required fields');
    }
  }
}