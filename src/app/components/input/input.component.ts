import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HmsService } from 'src/app/services/hms.service';

import { Module, AoI, Source, TimeZone, DataValueFormat, TemporalResolution } from '../../models/forms.model' ;

import { InputService } from "../../services/input.service"

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements OnInit {
  // modules: Module[] = [
  //   {value: 'Precipitation', viewValue: 'Precipitation'},
  //   {value: 'Air_Temperature', viewValue: 'Air Temperature'},
  //   {value: 'Relative_Humidity', viewValue: 'Relative Humidity'}
  // ];
    modules: String[] = [];

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
    private inputService: InputService,
    private hms: HmsService,
  ) { }
  @Output() requestSent: EventEmitter<any> = new EventEmitter<any>();
  buttonState = "Form incomplete"
  
  ngOnInit(): void {
    this.hms.getSwagger().subscribe((response) => {
      console.log('response: ', response);

      // This will get the available hydrology modules
      const re = new RegExp('^/(api)+/(hydrology)+/[^/]+$');

        let hydrologyInputs = Object.keys(response.paths)
      console.log(hydrologyInputs);

      hydrologyInputs.forEach(element => {
        let hydrologyUrl = element.match(re);
        if (hydrologyUrl) {
          console.log(hydrologyUrl)
          let urlvalues = (response.paths[hydrologyUrl.input].post.tags[0]).split(/(?=[A-Z])/)
          let hydrologyModules = urlvalues.splice(2,urlvalues.length).join(" ");
          this.modules.push(hydrologyModules);
        }
      });
    })
    
    this.inputForm = this.fb.group({
      module: [null, Validators.required],
      AoI: [null],
      lat: [null, Validators.required],
      lng: [null, Validators.required],
      catchmentID: [null],
      stationID: [null],
      source: [null, Validators.required],
      startDate: [null],
      timeZone: [null],
      endDate: [null],
      dataValueFormat: [null, Validators.required],
      temporalResolution: [null, Validators.required],
      output: [''],
    });
    this.addOutput('Welcome to HMS web...');
    this.addOutput('Click the map to enter coords.');

    // this sets the input panel buttons to random hue and each button to a random lightness :)
    const buttons = document.getElementsByTagName('button');
    const h = Math.floor(Math.random() * 360);      // [0, 360]
    for (let i = 0; i < buttons.length; i++) {
      const l = Math.floor(Math.random() * 60) + 20;  // [20, 80]
      const hsl = `hsl(${h}, 100%, ${l}%)`;
      buttons[i].style.backgroundColor = hsl;
    }
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


//   buildPostRequest(inputList) {
//     if (this.inputForm.valid) {
//       try {
//       return 
      
//     } catch {
//       alert("Could not create the request.")
//       return;
//     }
//   }
// }

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
  
  testGet(): void {
    this.hms.testGet().subscribe((response) => {
      this.addOutput("request sent to, https://ceamdev.ceeopdev.net/hms/rest/api/water-quality/solar/run");
      this.addOutput(JSON.stringify(response));
    })
  }

  testPostRequest = {
    "source": "nwis",
    "dateTimeSpan": {
      "startDate": "2015-01-01T00:00:00",
      "endDate": "2015-12-31T00:00:00",
      "dateTimeFormat": "yyyy-MM-dd HH"
    },
    "geometry": {
      "description": null,
      "comID": 0,
      "hucID": null,
      "stationID": null,
      "point": null,
      "geometryMetadata": {
        "gaugestation": "02191300"
      },
      "timezone": null
    },
    "dataValueFormat": "E3",
    "temporalResolution": "hourly",
    "timeLocalized": false,
    "units": "metric",
    "outputFormat": "json",
    "baseURL": null,
    "inputTimeSeries": null
  }
  
  testPost(): void {
    this.hms.testPost(this.testPostRequest).subscribe((response) => { 
      if (!response.error) {
        this.addOutput(JSON.stringify(response));
      } else {
        console.log(response.error);
      }
    })
  }
}