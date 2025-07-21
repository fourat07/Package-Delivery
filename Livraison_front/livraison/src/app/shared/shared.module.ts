import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TopbarComponent } from './components/topbar/topbar.component';
import { MatListModule } from '@angular/material/list';

import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    SidebarComponent,
    TopbarComponent
  ],
  imports: [
    MatListModule,
    MatIconModule,
    RouterModule,
    CommonModule,
    
    
    MatSidenavModule,
    MatButtonModule,
    MatDividerModule,
    
],
   exports: [
    SidebarComponent,
    TopbarComponent // Exportez les composants réutilisables
  ]
})
export class SharedModule { }
