import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-multi-line-chart',
  templateUrl: './multi-line-chart.component.html',
  styleUrls: ['./multi-line-chart.component.css']
})
export class MultiLineChartComponent implements OnInit, OnChanges {

  // @ViewChild used to get this components child chart on a per component basis.
  // The static attribute is set to True to resolve query results before change
  // detection runs. Without this, changes are applied to data before chart is
  // retrieved and set to a variable.
  @ViewChild('chart', { static: true }) public chart: ElementRef;

  // @Input data must be of the specified format to properly render multi data
  // group charts.
  @Input() data: { type: string, x: any, y: number }[];

  svg: any;
  width: number;
  height: number;
  margin = { top: 30, right: 30, bottom: 70, left: 50 };
  scaleX: any;
  scaleY: any;

  public constructor(public chartElem: ElementRef) { }

  ngOnInit(): void {
    // The height is being set faster than footer can load. Set timeout to fix.
    setTimeout(() => {
      this.initChart();
      this.createChart();
    }, 10);

    // Add event listener to reload the chart on window resize
    window.addEventListener('resize', () => {
      this.reloadChart();
    });
    // Add event listener to reload the chart on expansion panel click
    document.querySelector('app-expansion-panel-left').addEventListener('click', () => {
      this.reloadChart();
    });
  }

  /**
   * Updates the chart when data changes. 
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('data') && this.data) {
      if (this.svg !== undefined && !changes.data.firstChange) {
        this.reloadChart();
      }
    }
  }

  /**
   * Reloads the chart.
   */
  private reloadChart(): void {
    // remove appended 'g's
    this.svg.selectAll('g').remove();
    // remove append 'paths'
    this.svg.selectAll('path').remove();
    // Re-init and draw
    this.initChart();
    this.createChart();
  }

  /**
   * Initializes the chart: width, height, and axis scales.
   * @private
   */
  private initChart(): void {
    this.svg = d3.select(this.chart.nativeElement);

    this.width = this.svg.style('width').replace('px', '');
    this.height = this.svg.style('height').replace('px', '');

    this.svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.scaleX = d3.scalePoint()
      .domain(this.data.map(i => {
        return i.x;
      }))
      .range([this.margin.left, this.width - this.margin.right]);

    this.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + 0 + ',' + (this.height - this.margin.bottom) + ')')
      .call(d3.axisBottom(this.scaleX).tickValues(this.scaleX.domain().filter((d, i) => i % 20 === 0)))
      .selectAll("text")
      .attr("y", 10)
      .attr("x", 5)
      .attr("dy", ".35em")
      .attr("transform", "rotate(30)")
      .style("text-anchor", "start");

    this.scaleY = d3.scaleLinear()
      .domain(d3.extent(this.data, d => d.y))
      .range([this.height - this.margin.bottom, this.margin.top / 2]);

    this.svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + this.margin.left + ', 0)')
      .call(d3.axisLeft(this.scaleY).ticks(5));
  }

  /**
   * Draws the chart on the webpage.
   * @private
   */
  private createChart(): void {

    // Parse the data data into keys based on type for d3 charting
    const sumstat = Array.from(d3.group(this.data, d => d.type),
      ([key, value]) => ({ key, values: value }));

    // Get each key and place in a list
    const lineNames = Object.keys(sumstat);

    // Create a function color() that returns a mapped hex color from a key name.
    const color = d3.scaleOrdinal().domain(lineNames).range([
      '#003f5c',
      '#58508d',
      '#bc5090',
      '#ff6361',
      '#ffa600'
    ]);

    // Draw the chart

    this.svg.selectAll('.line')
      .style('background', 'none')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('display', 'block')
      .data(sumstat)
      .enter()
      .append('path')
      .attr('d', d => {
        return d3.line()
          .x(D => {
            return this.scaleX(D[`x`]);
          })
          .y(D => this.scaleY(D[`y`]))
          .curve(d3.curveBasis)
          (d.values);
      })
      .attr('fill', 'none')
      .attr('stroke', d => {
        return color(d.key) as string;
      })
      .attr('stroke-width', 2);
  }
}