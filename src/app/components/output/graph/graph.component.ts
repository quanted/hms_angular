import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';

import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {
  constructor(
    private session: SessionService
    ) {}

  data = {};
  dataKeys: string[];
  dataArray: [];

  chartData = [];

  ngOnInit(): void {
    this.data = this.session.getData()['data'];
    this.dataKeys = Object.keys(this.data);
    this.initChart();
    this.createChart();
  }

  private initChart(): void {
    // transform data array to form d3 expects 
    // [{x: 0, y: 93.24},
    // {x: 1, y: 95.35},
    // {x: 2, y: 98.84},
    // {x: 3, y: 99.92},
    // {x: 4, y: 99.8},
    // {x: 5, y: 99.47}, ...]

    this.dataKeys.forEach((key) => {
      this.chartData.push({ x: this.dataKeys.indexOf(key), y: this.data[key][0]})
    })
    console.log('chartData: ', this.chartData);

    // then build string array for labels, figure out if you want by hour/day/month/year based on the size of the data
  }

  private createChart(): void {
    d3.select('svg')
    .attr("width", 400)
    .attr("height", 300)
    .style("display", "block")
    .append("path")
      .datum(this.chartData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
      .x((d) => { return d['x'] })
      .y((d) => { return d['y'] })
      )
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.data) {
      this.initChart();
      this.createChart();
    }
  }
}
