import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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

  svg: any;
  g: any;
  tooltip: any;
  margin = { top: 30, right: 30, bottom: 30, left: 30 };
  padding: { top: number; right: number; bottom: number; left: number; };
  contentWidth: number;
  contentHeight: number;
  data = {};
  dataKeys: string[];
  chartData = [];
  chartData2 = [];

  width;
  height;

  scaleX;
  scaleY;

  ngOnInit(): void {
    this.data = this.session.getData()['data'];
    this.dataKeys = Object.keys(this.data);
    this.initChart();
    this.createChart();
  }

  private initChart(): void {
    // const element = this.chartContainer.nativeElement;

    this.svg = d3.select('svg');

    // this.margin = {
    //   top: this.svg.style('margin-top').replace('px', ''),
    //   right: this.svg.style('margin-right').replace('px', ''),
    //   bottom: this.svg.style('margin-bottom').replace('px', ''),
    //   left: this.svg.style('margin-left').replace('px', '')
    // };

    this.padding = {
      top: this.svg.style('padding-top').replace('px', ''),
      right: this.svg.style('padding-right').replace('px', ''),
      bottom: this.svg.style('padding-bottom').replace('px', ''),
      left: this.svg.style('padding-left').replace('px', '')
    };

    // this.width = this.svg.style('width').replace('px', '');
    // this.height = this.svg.style('height').replace('px', '');
    this.width = 400;
    this.height = 500;
    // this.contentWidth = this.width - this.margin.left - this.margin.right - this.padding.left - this.padding.right;
    // this.contentHeight = this.height - this.margin.top - this.margin.bottom;

    this.svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    // transform data array to form d3 expects 
    // [{x: 0, y: 93.24},
    // {x: 1, y: 95.35},
    // {x: 2, y: 98.84},
    // {x: 3, y: 99.92},
    // {x: 4, y: 99.8},
    // {x: 5, y: 99.47}, ...]

    this.dataKeys.forEach((key) => {
      const newValue = this.data[key][0].split('E')[0];
      this.chartData.push({ date: key, value: newValue});
      this.chartData2.push({ date: key, value: parseFloat(newValue) + (Math.random() * 10 - 5) })
    })
    
    console.log('chartData: ', this.chartData);
    this.scaleX = d3.scalePoint()
        .domain(this.dataKeys)
        .range([this.margin.left, this.width - this.margin.right]);

    this.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(' + 0 + ',' + (this.height - this.margin.bottom) + ')')
        .call(d3.axisBottom(this.scaleX)); // Create an axis component with d3.axisBottom

    this.scaleY = d3.scaleLinear()
        .domain(d3.extent(this.chartData, d =>  d.value))
        .range([this.height - this.margin.bottom, 0 + this.margin.top]);

    this.svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + this.margin.left + ', 0)')
        .call(d3.axisLeft(this.scaleY)); // Create an axis component with d3.axisLeft

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
        .attr("stroke", "magenta")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
        .x((d) => {
          // console.log(this.scaleX(d['date']));
          return this.scaleX(d['date']);
        })
        .y((d) => { return this.scaleY(d['value']) })
      );
    d3.select('svg').append("path")
      .datum(this.chartData2)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
      .x((d) => {
        // console.log(this.scaleX(d['date']));
        return this.scaleX(d['date']);
      })
      .y((d) => { return this.scaleY(d['value']) })
    );
    
    // const tooltip = this.svg.append("g");
    // this.svg.on("touchmove mousemove", function(event) {
    //   tooltip
    //       .attr("transform", `translate(${this.scaleX(event[0])},${this.scaleY(event[1])})`)
    //       .call(this.callout, `${this.scaleX(event[0])},${this.scaleY(event[1])}`);
    // });
    // this.svg.on("touchend mouseleave", () => tooltip.call(this.callout, null));
  }

  callout(g, value) {
    if (!value) return g.style("display", "none");
  
    g
        .style("display", null)
        .style("pointer-events", "none")
        .style("font", "10px sans-serif");
  
    const path = g.selectAll("path")
      .data([null])
      .join("path")
        .attr("fill", "white")
        .attr("stroke", "black");
  
    const text = g.selectAll("text")
      .data([null])
      .join("text")
      .call(text => text
        .selectAll("tspan")
        .data((value + "").split(/\n/))
        .join("tspan")
          .attr("x", 0)
          .attr("y", (d, i) => `${i * 1.1}em`)
          .style("font-weight", (_, i) => i ? null : "bold")
          .text(d => d));
  
    const {x, y, width: w, height: h} = text.node().getBBox();
  
    text.attr("transform", `translate(${-w / 2},${15 - y})`);
    path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
  }
}
