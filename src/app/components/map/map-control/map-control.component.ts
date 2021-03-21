import { Component, OnInit } from '@angular/core';

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

  constructor(
    private map: MapService
  ) {}
  
  ngOnInit(): void {
    const layers = this.map.getLayers();
    this.basemaps = layers.basemaps;
    this.features = layers.features;
  }

  issueCommand(command, controlButton?): void {
    let commandMessage;
    switch(command) {
      case 'toggle':
        commandMessage = {
          command: command,
          name: controlButton.name,
          layerType: controlButton.type
        }
        this.map.controlCommand(commandMessage);
        break;
      default:
        console.log('UNKNOWN COMMAND.TYPE ', commandMessage);
    }
  }
}