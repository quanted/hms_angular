import { Component, ViewChild, Input, SimpleChanges, OnChanges } from "@angular/core";
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
        hiddenElement.download = "table.csv";
        hiddenElement.click();
    }
}
