import { Component, OnInit } from '@angular/core';
import { LayerService } from 'src/app/services/layer.service';

import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-map-control',
  templateUrl: './map-control.component.html',
  styleUrls: ['./map-control.component.css']
})
export class MapControlComponent implements OnInit {
  basemaps =[];
  features = [];

  constructor(
    private map: MapService,
    private layers: LayerService
  ) {}
  
  ngOnInit(): void {
    const layers = this.map.getLayers();
    this.basemaps = layers.basemaps;
    this.features = layers.features;
  }

  issueCommand(command, controlButton?): void {
    let commandMessage;
    switch(command) {
      case 'refresh':
        commandMessage = {
          command: command
        }
        break;
      case 'toggle':
        commandMessage = {
          command: command,
          name: controlButton.name,
          layerType: controlButton.type
        }
        break;
      default:
        console.log('UNKNOWN COMMAND.TYPE ', commandMessage);
    }
    this.map.controlCommand(commandMessage);
  }
}