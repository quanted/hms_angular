import { Component, OnInit, ViewChild } from '@angular/core';

import { InputComponent } from '../input/input.component';
import { MapComponent } from '../map/map.component';
import { MapControlComponent } from '../map/map-control/map-control.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor() { }

  @ViewChild(InputComponent, { static: false })
  private input: InputComponent;
  @ViewChild(MapComponent, { static: false })
  private map: MapComponent;
  @ViewChild(MapControlComponent, { static: false })
  private control: MapControlComponent;

  ngOnInit(): void {
  }

  requestSent($event): void {
    this.map.requestSent($event);
  }

  mapClick($event): void {
    this.input.mapClick($event);
  }

  layerUpdate($event): void {
    this.control.layerUpdate($event);
  }

  controlClicked($event): void {
    this.map.controlClicked($event);
  }

}