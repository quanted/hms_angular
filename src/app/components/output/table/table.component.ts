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

  columnNames = [];
  columnData = [];

  ngOnInit(): void {
    const items = this.session.getData();
    const metadata = items['metadata'];
    const metaKeys = Object.keys(metadata);
    const data = items['data'];
    const dataKeys = Object.keys(data);

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

    /* building the data array */
    for (let i = 0; i < dataKeys.length; i ++) {
      const record = [];
      record.push(dataKeys[i]);
      for (let j = 0; j < data[dataKeys[i]].length; j++) {
        record.push(data[dataKeys[i]][j]);
      }
      this.columnData.push(record);
    }
  }
}
