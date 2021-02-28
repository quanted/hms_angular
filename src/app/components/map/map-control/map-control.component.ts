import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LayerService } from 'src/app/services/layer.service';

@Component({
  selector: 'app-map-control',
  templateUrl: './map-control.component.html',
  styleUrls: ['./map-control.component.css']
})
export class MapControlComponent implements OnInit {
  basemaps = [];
  features = [];

  constructor(
    private layerService: LayerService,
  ) {}
  @Output() controlClicked: EventEmitter<any> = new EventEmitter<any>();
  
  ngOnInit(): void {
    this.basemaps = this.layerService.getBasemapLayers();
    this.features = this.layerService.getFeatureLayers();
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
    this.controlClicked.emit(commandMessage);
  }

  layerUpdate(layers): void {
    this.basemaps = layers.basemaps;
    this.features = layers.features;
  }
}