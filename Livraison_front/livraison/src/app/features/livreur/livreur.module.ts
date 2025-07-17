import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LivreurRoutingModule } from './livreur-routing.module';
import { LivreurComponent } from './livreur.component';


@NgModule({
  declarations: [
    LivreurComponent
  ],
  imports: [
    CommonModule,
    LivreurRoutingModule
  ]
})
export class LivreurModule { }
