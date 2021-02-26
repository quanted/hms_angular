import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InputComponent } from './components/input/input.component';

import { MapComponent } from './components/map/map.component';

const routes: Routes = [
  { path: "", component: MapComponent },
  { path: "inputform", component: InputComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
