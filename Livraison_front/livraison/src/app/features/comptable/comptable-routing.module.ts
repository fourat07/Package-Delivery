import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComptableComponent } from './comptable.component';

const routes: Routes = [{ path: '', component: ComptableComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComptableRoutingModule { }
