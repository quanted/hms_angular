import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { MainComponent } from "./components/main/main.component";
import { OutputComponent } from "./components/output/output.component";

const routes: Routes = [
    { path: "", component: MainComponent },
    { path: "home", component: MainComponent },
    { path: "output", component: OutputComponent },
    { path: "output/:comid", component: OutputComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: "legacy" })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
