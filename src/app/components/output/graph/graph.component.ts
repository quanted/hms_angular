import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import {scaleLinear} from "d3-scale";
import * as d3 from 'd3';

import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {
  constructor(private session: SessionService) { }
  @ViewChild('chart', { static: true }) protected chartContainer: ElementRef;
  @Input() data: any;
  svg: any;
  g: any;
  tooltip: any;
  margin: { top: number; right: number; bottom: number; left: number; };
  padding: { top: number; right: number; bottom: number; left: number; };
  contentWidth: number;
  contentHeight: number;
  width: number;
  height: number;

  

  ngOnInit(): void {
    const items = this.session.getData()
    this.data = items['data']
  }

  private initChart(): void {
    const element = this.chartContainer.nativeElement;

    this.svg = d3.select(element);

    this.margin = {
      top: this.svg.style('margin-top').replace('px', ''),
      right: this.svg.style('margin-right').replace('px', ''),
      bottom: this.svg.style('margin-bottom').replace('px', ''),
      left: this.svg.style('margin-left').replace('px', '')
    };

    this.padding = {
      top: this.svg.style('padding-top').replace('px', ''),
      right: this.svg.style('padding-right').replace('px', ''),
      bottom: this.svg.style('padding-bottom').replace('px', ''),
      left: this.svg.style('padding-left').replace('px', '')
    };

    this.width = this.svg.style('width').replace('px', '');
    this.height = this.svg.style('height').replace('px', '');

    this.contentWidth = this.width - this.margin.left - this.margin.right - this.padding.left - this.padding.right;
    this.contentHeight = this.height - this.margin.top - this.margin.bottom;

    this.g = this.svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  private createChart(): void {
    // Add title
    this.svg.append('text')
      .attr('x', (this.contentWidth / 2))
      .attr('y', 0 - (this.margin.bottom / 2))
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('elastic-net neg_mean_absolute_error');

    // Add X axis
    const x = d3.scaleLinear()
      .domain([1, this.data[0].length])
      .range([ 0, this.contentWidth ]);
    this.g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + 0 + ',' + this.contentHeight + ')')
      .call(d3.axisBottom(x)); // Create an axis component with d3.axisBottom

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([Math.min(...this.data[1]),
        Math.max(...this.data[1]) + 1])
      .range([this.contentHeight, 0]);
    this.g.append('g')
      .attr('class', 'y axis')
      // .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
      .call(d3.axisLeft(y)); // Create an axis component with d3.axisLeft

    // Add y data
    let index = 0;
    const lines = this.g.append('path')
      .datum(this.data[1])
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', d3.line()
        .x(() => x(index += 1))
        .y((d) => {
          return y(Number(d));
        })
      );

    // Add labels
    lines.selectAll('text')
      .data(this.data)
      .enter();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.data) {
      this.initChart();
      this.createChart();
    }
  }

}
