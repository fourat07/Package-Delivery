import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LivreurRoutingModule } from './livreur-routing.module';
import { LivreurComponent } from './livreur.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    LivreurComponent

  ],
  imports: [
    CommonModule,
    LivreurRoutingModule,
    SharedModule
  ]
})
export class LivreurModule { }
