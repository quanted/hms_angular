import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { HttpErrorInterceptor } from "./interceptors/http-error.interceptor";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";

import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatNativeDateModule } from "@angular/material/core";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSortModule } from "@angular/material/sort";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from "./app.component";
import { MapComponent } from "./components/map/map.component";
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { InputComponent } from "./components/input/input/input.component";

import { CookieService } from "ngx-cookie-service";
import { MainComponent } from "./components/main/main.component";
import { MapControlComponent } from "./components/map/map-control/map-control.component";
import { AboutComponent } from "./components/about/about.component";
import { ExpansionPanelRightComponent } from "./components/ui/expansion-panel-right/expansion-panel-right.component";
import { ExpansionPanelLeftComponent } from "./components/ui/expansion-panel-left/expansion-panel-left.component";
import { HttpHeadersInterceptor } from "./interceptors/http-headers.interceptor";
import { LayerControlComponent } from "./components/map/layer-control/layer-control.component";
import { TableComponent } from "./components/output/table/table.component";
import { LandingComponent } from "./components/landing/landing.component";
import { ComidSelectInputComponent } from "./components/input/comid-select-input/comid-select-input.component";
import { SegmentListComponent } from "./components/input/segment-list/segment-list.component";
import { OutputComponent } from "./components/output/output.component";
import { PlotlyComponent } from "./components/output/plotly/plotly.component";
import { PlotContainerComponent } from "./components/output/plot-container/plot-container.component";
import { ExecutionPanelComponent } from './components/output/execution-panel/execution-panel.component';
import { SegmentStatusListComponent } from './components/output/segment-status-list/segment-status-list.component';
import { MiniMapComponent } from './components/mini-map/mini-map.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    HeaderComponent,
    FooterComponent,
    MainComponent,
    MapControlComponent,
    AboutComponent,
    ExpansionPanelLeftComponent,
    InputComponent,
    ExpansionPanelRightComponent,
    LayerControlComponent,
    TableComponent,
    LandingComponent,
    ComidSelectInputComponent,
    SegmentListComponent,
    OutputComponent,
    PlotlyComponent,
    PlotContainerComponent,
    ExecutionPanelComponent,
    SegmentStatusListComponent,
    MiniMapComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatGridListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    DragDropModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpHeadersInterceptor,
      multi: true,
    },
    TableComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
