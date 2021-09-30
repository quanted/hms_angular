import { Component, Input, OnInit } from '@angular/core';
import { MiniMapService } from 'src/app/services/mini-map.service';

@Component({
  selector: 'app-mini-map',
  templateUrl: './mini-map.component.html',
  styleUrls: ['./mini-map.component.css'],
})
export class MiniMapComponent {

  constructor(private miniMap: MiniMapService) { }
}
