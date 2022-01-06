import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
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
  // Emit event to toggle legend
  @Output() toggleCSS: EventEmitter<boolean> = new EventEmitter<boolean>();
  // Emit event to add/remove selected catchment
  @Output() toggleCatchment: EventEmitter<string> = new EventEmitter<string>();
  // Any to hold the plot specific properties
  chart: any;
  // Legend state
  showLegend = false;

  ngOnInit() {
    this.draw();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && this.data && this.plotTitle) {
      this.chart.layout.title.text = this.plotTitle;
      this.chart.data = this.data;
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
            size: 9
          }
        },
        yaxis: {
          title: { text: this.yAxisTitle },
          tickfont: {
            size: 9
          }
        },
        margin: {
          l: 40,
          r: 30,
          b: 35,
          t: 40,
        },
        autosize: true,
        showlegend: this.showLegend,
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
    Plotly.newPlot(this.plot.nativeElement, this.chart).then(() => {
      (this.plot.nativeElement as any).on('plotly_legendclick', (event) => {
        this.toggleCatchment.emit(event.node.textContent);
      });
      // Sometimes plot drawn before views completely rendered. Fire
      // resize event to fix this.
      window.requestAnimationFrame(function () {
        window.dispatchEvent(new Event('resize'));
      });
    });
  }

  toggleLegend(event) {
    this.showLegend = !this.showLegend;
    this.toggleCSS.emit();
    this.chart.layout.showlegend = this.showLegend;
    Plotly.react(this.plot.nativeElement, this.chart);
  }
}
