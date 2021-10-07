import {
  Component,
  ViewChild,
  Input,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";

@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.css"],
})
export class TableComponent implements OnChanges {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /* Material table expects:
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

  ngOnChanges(changes: SimpleChanges): void {
    // Must reset these again when the data changes
    this.dataSource = new MatTableDataSource();
    this.dataSource.data = this.columnData;
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
}
