import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { InputComponent } from '../../input/input/input.component';

@Component({
  selector: 'app-expansion-panel-left',
  templateUrl: './expansion-panel-left.component.html',
  styleUrls: ['./expansion-panel-left.component.css']
})
export class ExpansionPanelLeftComponent implements OnInit {
  @Input() open: boolean;

  @ViewChild(InputComponent) input;
  welcome = false;

  constructor() { }

  ngOnInit(): void {
  }

  accept(): void {
    this.welcome = true;
  }

  updateCoords(coords): void {
    if (this.input) {
      this.input.updateCoords(coords);
    }
  }

  openPanel(): void {
    this.open = true;
  }

  closePanel(): void {
    this.open = false;
  }
}
