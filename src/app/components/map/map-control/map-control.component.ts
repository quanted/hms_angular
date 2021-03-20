import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-map-control',
  templateUrl: './map-control.component.html',
  styleUrls: ['./map-control.component.css']
})
export class MapControlComponent implements OnInit {
  basemaps =[];
  features = [];

  selectedFeature;

  styleForm = this.fb.group({
    color: [null],
    weight: [null],
    fillColor: [null],
    fillOpacity: [null]
  });

  constructor(
    private map: MapService,
    private fb: FormBuilder
  ) {}
  
  ngOnInit(): void {
    const layers = this.map.getLayers();
    this.basemaps = layers.basemaps;
    this.features = layers.features;
  }

  issueCommand(command, controlButton?): void {
    let commandMessage;
    switch(command) {
      case 'editor':
        this.selectedFeature = {...controlButton};
        this.styleForm.get('color').setValue(this.selectedFeature.layer.options.style.color);
        this.styleForm.get('weight').setValue(this.selectedFeature.layer.options.style.weight);
        this.styleForm.get('fillColor').setValue(this.selectedFeature.layer.options.style.fillColor);
        this.styleForm.get('fillOpacity').setValue(this.selectedFeature.layer.options.style.fillOpacity);
        break;
      case 'refresh':
        commandMessage = {
          command: command
        }
        this.map.controlCommand(commandMessage);
        break;
      case 'toggle':
        commandMessage = {
          command: command,
          name: controlButton.name,
          layerType: controlButton.type
        }
        this.map.controlCommand(commandMessage);
        break;
      case 'update-style':
        commandMessage = {
          command: command,
          name: this.selectedFeature.name,
          style: {
            color: this.styleForm.get('color').value,
            weight: this.styleForm.get('weight').value,
            fillColor: this.styleForm.get('fillColor').value,
            fillOpacity: this.styleForm.get('fillOpacity').value
          }
        }
        this.map.controlCommand(commandMessage);
        break;
      default:
        console.log('UNKNOWN COMMAND.TYPE ', commandMessage);
    }
  }
}