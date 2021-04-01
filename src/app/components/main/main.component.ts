import { Component, ViewChild } from '@angular/core';

import { ExpansionPanelLeftComponent } from '../ui/expansion-panel-left/expansion-panel-left.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent {

  coords;

  @ViewChild(ExpansionPanelLeftComponent) panel;
  constructor() { }

  updateCoords(coords): void {
    this.panel.updateCoords(coords);
  }
}
