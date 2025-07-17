import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpediteurComponent } from './expediteur.component';

const routes: Routes = [{ path: '', component: ExpediteurComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpediteurRoutingModule { }
