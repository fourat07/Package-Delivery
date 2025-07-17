import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpediteurRoutingModule } from './expediteur-routing.module';
import { ExpediteurComponent } from './expediteur.component';


@NgModule({
  declarations: [
    ExpediteurComponent
  ],
  imports: [
    CommonModule,
    ExpediteurRoutingModule
  ]
})
export class ExpediteurModule { }
