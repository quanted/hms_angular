import { Component, OnInit } from "@angular/core";

@Component({
    selector: "app-table-container",
    templateUrl: "./table-container.component.html",
    styleUrls: ["./table-container.component.css"],
})
export class TableContainerComponent implements OnInit {
    tableColumnNames = ["one", "two", "three", "four", "five", "six", "and another one", "some more data"];
    tableColumnData = [];

    constructor() {}

    ngOnInit(): void {
        for (let i = 1; i < 1000; i++) {
            this.tableColumnData.push({
                one: "10",
                two: "11",
                three: "12",
                four: "13",
                five: "14",
                six: "this is a test",
                "and another one": "another test",
                "some more data": "is this showing up?",
            });
        }
    }

    /**
     * Parses the data received from the HmsService and sets the table data
     * which updates the @Input() data in the table component. Places the
     * data in the correct format for the table component.
     */
    setTableData() {
        // Reset tables values
        // this.tableColumnData = [];
        // if (Object.keys(this.catchment_data).length > 0) {
        //     // Loop over each catchment
        //     for (let i = 0; i < this.dates.length; i++) {
        //         // Loop over length of data
        //         for (let j = 0; j < this.dropListData.selectedCatchments.length; j++) {
        //             let obj: any = {};
        //             // Loop over state variables
        //             for (let k = 2; k < this.tableColumnNames.length; k++) {
        //                 obj[this.tableColumnNames[0]] = this.dates[i].toString().split("GMT")[0];
        //                 obj[this.tableColumnNames[1]] = this.dropListData.selectedCatchments[j];
        //                 obj[this.tableColumnNames[k]] =
        //                     this.catchment_data[this.dropListData.selectedCatchments[j]]?.data[
        //                         this.tableColumnNames[k]
        //                     ][i];
        //             }
        //             // Push to table data
        //             this.tableColumnData.push(obj);
        //         }
        //     }
        // }
    }
}
