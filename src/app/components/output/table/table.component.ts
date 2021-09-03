import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  Input,
  SimpleChange,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.css"],
})
export class TableComponent implements OnChanges {
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

  ngOnChanges(changes: SimpleChanges): void {
    // Must reset these again when the data changes
    this.dataSource = new MatTableDataSource();
    this.dataSource.data = this.columnData;
    this.dataSource.data = this.columnData;
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.customSort();
  }

  customSort() {
    // Tell sorter Date column is a date else sort regularly
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case "Date":
          return new Date(item["Date"]);
        default:
          return item[property];
      }
    };
  }

  /**
   * Creates a csv file from the table data and downloads it.
   */
  download() {
    let names = [];
    for (let i = 0; i < this.columnNames.length; i++) {
      names.push(this.columnNames[i].replace(/,/g, ""));
    }
    let csv = names.join(",") + "\n";
    this.columnData.forEach((row) => {
      csv += Object.values(row).join(",") + "\r\n";
    });
    let hiddenElement = document.createElement("a");
    hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
    hiddenElement.target = "_blank";
    hiddenElement.download = this.catchment + ".csv";
    hiddenElement.click();
  }
}
