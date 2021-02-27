import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InputComponent } from './components/input/input.component';
import { MainComponent } from './components/main/main.component';

const routes: Routes = [
  { path: "", component: MainComponent },
  { path: "inputform", component: InputComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
