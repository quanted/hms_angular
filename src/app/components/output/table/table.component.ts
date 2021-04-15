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

    console.log('items: ', this.items);

    const metadata = this.items['metadata'];
    const metaKeys = Object.keys(metadata);

    const columns = [];

    /*
      columns: [["name", "unit", "whatever"], ["name2", "blah"]]
    */
    for (let key of metaKeys) {
      for (let i = 1; i < metaKeys.length; i++){
        if (key.startsWith('column_' + i)) {
          if (columns['column_' + i] === undefined) {
            columns['column_' + i] = metadata[key];
          } else {
            columns['column_' + i] += " (" + metadata[key] + ")";
            console.log(columns);
          }
        }
      }
    }
    for (let key of Object.keys(columns)) {
      this.columnNames.push(columns[key]);
    }

    console.log("Column Names:" + this.columnNames)

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
