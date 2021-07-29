import { Injectable } from '@angular/core';
import { SimulationService } from './simulation.service';

@Injectable({
  providedIn: 'root'
})
export class OutputService {

  lineData: any[] = [];
  types: string[] = [];
  selected: string[] = [];
  chartColors: string[] = [];
  catchments: any = {};

  constructor(private simulationService: SimulationService) { }

  /**
   * Parses Aquatox simulation json and gets the state variables outputs.
   * The outputs are parsed into the proper form for passing data to the d3 charts.  
   */
  getData() {
    // Call data endpoint for current simid
    const simResults = this.simulationService.getSimResults();
    // Get each comid and taskid from simResults
    this.catchments = simResults.catchments;
    // For each comid, make get request with taskid to get outputs
    Object.keys(this.catchments).forEach(comid => {
      const taskid = this.catchments[comid];
    });
    /*
    const sv = test_data['AQTSeg']['SV'];
    sv.forEach(element => {
      // Get SV name and units for label
      const type = `${element['PName']} (${element['SVoutput']['Metadata']['Unit_1']})`;
      this.types.push(type);
      // Loop through each Data element of the current element
      Object.keys(element['SVoutput']['Data']).forEach(item => {
        this.lineData.push({
          type: type,
          x: new Date(item),
          y: +element['SVoutput']['Data'][item][0].split('E')[0]
        });
      });
    });
    */
  }

  /**
   * Filter the data to only show the selected variables.
   */
  filterData() {
    this.lineData = this.lineData.filter(line => {
      return this.selected.indexOf(line.type) > -1;
    });
    console.log(this.lineData);
  }
}
