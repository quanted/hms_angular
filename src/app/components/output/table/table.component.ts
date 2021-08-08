import { Component, OnInit, AfterViewInit, ViewChild, Input } from "@angular/core";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";

@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.css"],
})
export class TableComponent implements OnInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /* Material table expects, it expects:
    columnNames = ["key1", "key2", ...]
    columnData = [
      { key1: value, key2: value, ... },
      { key1: value, key2: value, ... },
      { key1: value, key2: value, ... },
      { key1: value, key2: value, ... }
    ] 
  */
  @Input() columnNames: string[];
  @Input() columnData: {
    [key: string]: any;
  }[];
  dataSource = new MatTableDataSource();

  ngOnInit(): void {
    this.dataSource.data = this.columnData;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource();
    this.dataSource.data = this.columnData;
    this.dataSource.paginator = this.paginator;
  }
}
