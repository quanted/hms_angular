import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as Plotly from 'plotly.js/dist/plotly.js';

@Component({
  selector: 'app-plotly',
  templateUrl: './plotly.component.html',
  styleUrls: ['./plotly.component.css']
})
export class PlotlyComponent implements OnInit, OnChanges {

  @ViewChild("plot", { static: true }) public plot: ElementRef;

  // Titles
  @Input() plotTitle: string;
  @Input() xAxisTitle: string;
  @Input() yAxisTitle: string;
  // Array of data with x values, y values, type (line, bar, etc...),
  // and name for each line to be plotted 
  @Input() data: {
    x: Date,
    y: number,
    type: string,
    name: string,
  }[];

  chart: any;

  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    this.draw()
  }

  ngOnInit(): void {
    this.draw();
  }

  draw(): void {
    this.chart = {
      data: this.data,
      layout: {
        title: { text: this.plotTitle, font: { size: 20 } },
        xaxis: {
          title: { text: this.xAxisTitle },
        },
        yaxis: {
          title: { text: this.yAxisTitle },
        }
      },
      config: {
        responsive: true,
      }
    };
    Plotly.newPlot(this.plot.nativeElement, this.chart);
  }
}
