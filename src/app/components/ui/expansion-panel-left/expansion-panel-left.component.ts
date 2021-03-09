import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-expansion-panel-left',
  templateUrl: './expansion-panel-left.component.html',
  styleUrls: ['./expansion-panel-left.component.css']
})
export class ExpansionPanelLeftComponent implements OnInit {
  @Input() open: boolean;
  activePanel = 'about';

  constructor() { }

  ngOnInit(): void {
  }

  show(panel): void {
    this.activePanel = panel;
  }

  openPanel(): void {
    this.open = true;
  }

  closePanel(): void {
    this.open = false;
  }
}
