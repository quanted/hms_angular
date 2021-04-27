import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
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

  dataKeys: any;



  ngOnInit(): void {
    const items = this.session.getData()
    this.data = items['data']
    if (this.data) {
      this.dataKeys = Object.keys(this.data);
      this.initChart();
      this.createChart();
    }
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
      .text('HMS Data');

         // Add X axis
    const xScale = d3.scaleLinear()
      .domain([0, this.dataKeys.length ])
      .range([ 0, this.contentWidth ]);
      /*
    this.g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + 0 + ',' + this.contentHeight + ')')
      .call(d3.axisBottom(x)); // Create an axis component with d3.axisBottom
      */
    const xAxisGenerator = d3.axisBottom(xScale);
    const xAxis =  this.g.append("g")
              .attr('class', 'x axis')
              .attr('transform', 'translate(' + 0 + ',' + this.contentHeight + ')')
              .call(xAxisGenerator);
    xAxisGenerator.tickFormat((d,i) => { 
      console.log(this.dataKeys[i])
      return this.dataKeys[i]
    });

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([Math.min(this.dataKeys),
        Math.max(this.dataKeys) + 1])
      .range([this.contentHeight, 0]);
    this.g.append('g')
      .attr('class', 'y axis')
      // .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
      .call(d3.axisLeft(y)); // Create an axis component with d3.axisLeft

    // Get y data
    let yData = this.dataKeys.forEach(key => {
        console.log(this.data[key][0]);
        return this.data[key][0];
    });

    // Add y data
    let index = 0;
    const lines = this.g.append('path')
      .datum(yData)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', d3.line()
        .x((d) => {
          return xScale(d)
        })
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
