import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as Plotly from 'plotly.js/dist/plotly.js';

@Component({
  selector: 'app-plotly',
  templateUrl: './plotly.component.html',
  styleUrls: ['./plotly.component.css']
})
export class PlotlyComponent implements OnChanges {
  // Get access to the plot element in the DOM
  @ViewChild("plot", { static: true }) public plot: ElementRef;

  // Titles
  @Input() plotTitle: string;
  @Input() xAxisTitle: string;
  @Input() yAxisTitle: string;
  // Array of data with x values, y values, type (line, bar, etc...),
  // and name for each line to be plotted 
  @Input() data: {
    x: Date[],
    y: number[],
    type: string,
    name: string,
  }[];
  // Any to hold the plot specific properties
  chart: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data.firstChange) {
      this.draw();
    } else if (!changes.data.firstChange) {
      this.setChart();
      Plotly.react(this.plot.nativeElement, this.chart);
    }
  }

  setChart() {
    // Set plot specific properties
    this.chart = {
      data: this.data,
      layout: {
        title: { text: this.plotTitle, font: { size: 14 } },
        xaxis: {
          title: { text: this.xAxisTitle },
          tickfont: {
            size: 10
          }
        },
        yaxis: {
          title: { text: this.yAxisTitle },
          tickfont: {
            size: 10
          }
        },
        margin: {
          l: 40,
          r: 30,
          b: 35,
          t: 40,
          pad: 0
        },
        autosize: true,
        showlegend: true,
        legend: {
          x: 1,
          xanchor: 'right',
          y: 0.9
        }
      },
      config: {
        responsive: true,
        displaylogo: false,
        useResizeHandler: true,
        style: { width: "100%", height: "100%" },
      },
    };
  }
  draw(): void {
    this.setChart();
    // Plot 
    Plotly.newPlot(this.plot.nativeElement, this.chart);
    window.dispatchEvent(new Event('resize'));
  }
}
