import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { HttpErrorInterceptor } from "./interceptors/http-error.interceptor";
import { HttpHeadersInterceptor } from "./interceptors/http-headers.interceptor";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";

import { CdkTableModule } from "@angular/cdk/table";
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
import { MatMenuModule } from "@angular/material/menu";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { DragDropModule } from "@angular/cdk/drag-drop";

import { AppComponent } from "./app.component";
import { MapComponent } from "./components/main/map/map.component";
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { InputComponent } from "./components/main/input/input/input.component";

import { MainComponent } from "./components/main/main.component";
import { MapControlComponent } from "./components/main/map/map-control/map-control.component";
import { AboutComponent } from "./components/main/about/about.component";
import { ExpansionPanelRightComponent } from "./components/ui/expansion-panel-right/expansion-panel-right.component";
import { ExpansionPanelLeftComponent } from "./components/ui/expansion-panel-left/expansion-panel-left.component";
import { LayerControlComponent } from "./components/main/map/layer-control/layer-control.component";
import { TableComponent } from "./components/output/table/table.component";
import { ComidSelectInputComponent } from "./components/main/input/comid-select-input/comid-select-input.component";
import { SegmentListComponent } from "./components/main/input/segment-list/segment-list.component";
import { OutputComponent } from "./components/output/output.component";
import { PlotlyComponent } from "./components/output/plotly/plotly.component";
import { PlotContainerComponent } from "./components/output/plot-container/plot-container.component";
import { ExecutionPanelComponent } from "./components/main/execution-panel/execution-panel.component";
import { SegmentStatusListComponent } from "./components/ui/segment-status-list/segment-status-list.component";
import { MiniMapComponent } from "./components/output/mini-map/mini-map.component";
import { AboutOutputComponent } from "./components/output/about-output/about-output.component";
import { OutputPanelComponent } from "./components/output/output-panel/output-panel.component";

import { TableContainerComponent } from "./components/output/table-container/table-container.component";
import { MapContainerComponent } from "./components/output/map-container/map-container.component";
import { ListContainerComponent } from "./components/output/list-container/list-container.component";

import { KeepScrollOnBottomDirective } from "./directives/keep-scroll-on-bottom.directive";
import { FluidHeightDirective } from "./directives/fluid-height.directive";

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
        ComidSelectInputComponent,
        SegmentListComponent,
        OutputComponent,
        PlotlyComponent,
        PlotContainerComponent,
        ExecutionPanelComponent,
        SegmentStatusListComponent,
        MiniMapComponent,
        AboutOutputComponent,
        OutputPanelComponent,
        TableContainerComponent,
        MapContainerComponent,
        ListContainerComponent,
        KeepScrollOnBottomDirective,
        FluidHeightDirective,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CdkTableModule,
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
        DragDropModule,
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
export class AppModule {}
