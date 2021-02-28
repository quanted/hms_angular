import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-map-control',
  templateUrl: './map-control.component.html',
  styleUrls: ['./map-control.component.css']
})
export class MapControlComponent implements OnInit {
  basemaps = [];
  features = [];

  constructor() { }
  @Output() controlClicked: EventEmitter<any> = new EventEmitter<any>();
  
  ngOnInit(): void {
  }

  controlClick(buttonClick): void {
    let message;
    if (buttonClick == 'refresh') {
      message = {
        type: 'refresh'
      };
    } else {
      message = {
        type: 'toggle',
        name: buttonClick.name,
        layerType: buttonClick.type
      };
    }
    this.controlClicked.emit(message);
  }

  layerUpdate(layers): void {
    console.log(layers);
    this.basemaps = layers.basemaps;
    this.features = layers.features;
  }

}
