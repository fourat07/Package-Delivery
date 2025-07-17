import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComptableRoutingModule } from './comptable-routing.module';
import { ComptableComponent } from './comptable.component';


@NgModule({
  declarations: [
    ComptableComponent
  ],
  imports: [
    CommonModule,
    ComptableRoutingModule
  ]
})
export class ComptableModule { }
