import { Component, OnInit } from '@angular/core';
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

  chartData = [];

  width = 192;
  height = 500;

  scaleX;
  scaleY;

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
      this.chartData.push({ date: this.dataKeys.indexOf(key), value: this.data[key][0]})
    })
    console.log('chartData: ', this.chartData);
    this.scaleX = d3.scaleLinear().domain(d3.extent(this.chartData, d =>  d.date)).range([0, this.width])
    this.scaleY = d3.scaleLinear().domain(d3.extent(this.chartData, d =>  d.value)).range([0, this.height])

    // then build string array for labels, figure out if you want by hour/day/month/year based on the size of the data
  }

  private createChart(): void {
    d3.select('svg')
      .style("background", "lightgray")
      .attr("width", this.width)
      .attr("height", this.height)
      .style("display", "block")
      .append("path")
        .datum(this.chartData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
        .x((d) => { return d['date'] })
        .y((d) => { return d['value'] })
        // .x((d) => { return this.scaleX(d['date']) })
        // .y((d) => { return this.scaleY(d['value']) })
      )
  }
}
