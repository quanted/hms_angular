import { Component, OnInit, AfterViewInit, ViewChild, Input } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from '@angular/material/sort';

@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.css"],
})
export class TableComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  /* Material table expects:
    columnNames = ["key1", "key2", ...]
    columnData = [
      { key1: value, key2: value, ... },
      { key1: value, key2: value, ... },
      { key1: value, key2: value, ... },
      { key1: value, key2: value, ... }
    ] 
  */
  @Input() catchment: string;
  @Input() columnNames: string[];
  @Input() columnData: {
    [key: string]: any;
  }[];
  dataSource = new MatTableDataSource();

  ngOnInit(): void {
    this.dataSource.data = this.columnData;
  }

  ngAfterViewInit(): void {
    // Must set these after view init
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.customSort();
  }

  ngOnChanges(): void {
    // Must rest these again when the data changes
    this.dataSource = new MatTableDataSource();
    this.dataSource.data = this.columnData;
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.customSort();
  }

  customSort() {
    // Tell sorter Date column is a date else sort regularly
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'Date': return new Date(item['Date']);
        default: return item[property];
      }
    };
  }
}
