import { Component, OnInit, HostListener } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  title = "HMS";
  screenWidth: number;
  screenHeight: number;

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    console.log(`size: ${this.screenWidth}, ${this.screenHeight}`);
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    console.log(`size: ${this.screenWidth}, ${this.screenHeight}`);
  }
}
