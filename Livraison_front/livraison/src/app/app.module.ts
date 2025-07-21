import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { FooterComponent } from './layouts/components/footer/footer.component';
import { HeaderComponent } from './layouts/components/header/header.component';


import { NotfoundComponent } from './layouts/components/notfound/notfound.component';
import { NavbarComponent } from './layouts/components/navbar/navbar.component';
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from '@angular/common';

import { MatBadgeModule } from '@angular/material/badge';
import { SharedModule } from "./shared/shared.module";



@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
    NotfoundComponent,
    NavbarComponent,
    
    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    NoopAnimationsModule,
    MatIconModule,
    MatBadgeModule,
    SharedModule
],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }


