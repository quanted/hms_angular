import { Component, OnInit } from '@angular/core';
import { OutputService } from 'src/app/services/output.service';

@Component({
  selector: 'app-output',
  templateUrl: './output.component.html',
  styleUrls: ['./output.component.css']
})
export class OutputComponent implements OnInit {

  constructor(private outputService: OutputService) { }

  ngOnInit(): void {
  }
}
