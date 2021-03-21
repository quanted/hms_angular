import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-layer-control',
  templateUrl: './layer-control.component.html',
  styleUrls: ['./layer-control.component.css']
})
export class LayerControlComponent implements OnInit {
  @Input() feature;

  controlOpen = false;

  styleForm = this.fb.group({
    color: [null],
    weight: [null],
    fillColor: [null],
    fillOpacity: [null]
  });

  constructor(
    private fb: FormBuilder,
    private map: MapService
  ) { }

  ngOnInit(): void {
    this.styleForm.setValue(this.feature.layer.options.style);
  }
  
  issueCommand(command): void {
    let commandMessage;
    switch(command) {
      case 'toggle':
        commandMessage = {
          command: command,
          name: this.feature.name,
          layerType: this.feature.type
        }
        this.map.controlCommand(commandMessage);
        break;
      case 'update-style':
        commandMessage = {
          command: command,
          name: this.feature.name,
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
        console.log('UNKNOWN COMMAND.TYPE ', command);
    }
  }

  toggleControl(): void {
    this.controlOpen = !this.controlOpen;
  }
}
