import { Injectable } from '@angular/core';
import * as test_data from './../../base_jsons/output_sim.json';

@Injectable({
  providedIn: 'root'
})
export class OutputService {

  lineData: any[] = [];
  types: string[] = [];

  constructor() { }

  /**
   * Parses Aquatox simulation json and gets the state variables outputs.
   * The outputs are parsed into the proper form for passing data to the d3 charts.  
   */
  getData() {
    const sv = test_data['AQTSeg']['SV'];
    sv.forEach(element => {
      // Get SV name and units for label
      const type = `${element['PName']} (${element['SVoutput']['Metadata']['Unit_1']})`;
      this.types.push(type);
      // Loop through each Data element of the current element
      Object.keys(element['SVoutput']['Data']).forEach(item => {
        this.lineData.push({
          type: type,
          x: item,
          y: +element['SVoutput']['Data'][item][0].split('E')[0]
        });
      });
    });
  }
}
