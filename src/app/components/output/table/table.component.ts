import { Component, OnInit } from '@angular/core';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  constructor(
    private session: SessionService
  ) { }

  items = {};

  columnNames = [];
  columnData = [];

  ngOnInit(): void {
    this.items = this.session.getData();
    const metadata = this.items['metadata'];
    const metaKeys = Object.keys(metadata);

    /* Building the column names array */
    // we know that all columns have a string name that is stored in the metadata
    // property 'column_n' where n is the number of the column, starting at 1.
    // columns may also have additional descriptors that do NOT have a related column
    // in the data. these descriptors are stored in the metadata
    // as 'column_n_descriptor', descriptor being whatever that item is, ie unit.

    // index to track which column were on
    let index = 1;

    // because metaKeys is an array we need the index of column_n to get the value
    let key = metaKeys.indexOf(`column_${index}`);
    // using that index to get the string value, ie 'column_1'
    // to get the actual column name value
    let col = metaKeys[key];

    // as long as 'column_' + index returns something there's more columns
    // so keep going until there isn't
    while (col !== undefined) {
      // there's comething there so add the value to the array of column names
      this.columnNames.push(metadata[col]);

      // increment the index and update the variables for the next loop iteration
      key = metaKeys.indexOf(`column_${++index}`);
      col = metaKeys[key];
    }

    // for (let key of metaKeys) {
    //   for (let i = 1; i < metaKeys.length; i++){
    //     if (key.startsWith('column_' + i)) {
    //       if (columns['column_' + i] === undefined) {
    //         columns['column_' + i] = metadata[key];
    //         columnArray.push(['column_' + i, metadata[key]]);
    //         sortedArray = columnArray.sort( function(a,b) {
    //           if (a[0] < b[0]) return -1;
    //           if (a[0] > b[0]) return 1;
    //           return 0
    //         });
    //       } else {
    //         columnArray[i - 1][1] = columns['column_' + i] + " (" + metadata[key] + ")";
    //       }
    //     }
    //   }
    // }

    // console.log(sortedArray);
    
    // for (let key of Object.keys(columns)) {
    //   this.columnNames.push(sortedArray);
    // }

    // sortedArray.forEach(value => {
    //   this.columnNames.push(value[1])
    // });

    // console.log("Column Names:" + this.columnNames)

    /* building the data array */
    const keys = Object.keys(this.items['data']);
    const data = [];

    for (let i = 0; i < keys.length; i++) {
      data.push(this.items['data'][keys[i]]);
    }
    
    for (let i = 0; i < data.length; i ++) {
      const record = [];
      record.push(keys[i]);

      for (let j = 0; j < data[i].length; j++) {
        record.push(data[i][j]);
      }
      this.columnData.push(record);
    }
    console.log('columnData: ', this.columnData);
  }
}
