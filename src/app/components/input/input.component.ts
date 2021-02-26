import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';



interface Module {
  value: string;
  viewValue: string;
}

interface AoI {
  value: string;
  viewValue: string;
}

interface Source {
  value: string;
  viewValue: string;
}

interface TimeZone {
  value: string;
  viewValue: string;
}

interface OutputDataFormat {
  value: string;
  viewValue: string;
}

interface TemporalResolution {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements OnInit {
  inputForm: FormGroup;

  selectedModule: string;
  selectedAoI: string;
  selectedSource: string;
  selectedTimeZone: string;
  selectedResolution: string;
  selectedDataFormat: string;

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


  constructor(private fb: FormBuilder) { }
  
  items = null;
  
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
    })
  }

  showParameters() {
    this.items = this.inputForm.value

    // parameters = null;

    // items = parameters;
    
    //   this.inputForm.get("name").value,
    // start: this.sourceForm.get("sourceType").value,
    // intensity: this.sourceForm.get("intensity").value,
    // distance: this.sourceForm.get("distance").value,
    // lat: this.sourceForm.get("lat").value,
    // lng: this.sourceForm.get("lng").value,

    }
  }
  


