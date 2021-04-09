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

    for (let key of metaKeys) {
      if (key.startsWith('column')) {
        this.columnNames.push(metadata[key]);
      }
    }

    console.log('names: ', this.columnNames);

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
