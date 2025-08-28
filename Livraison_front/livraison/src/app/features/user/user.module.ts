import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { UserService } from './services/user/user.service';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  providers: [UserService],

  declarations: [
    UserComponent,
    LoginComponent,
    
    ForgotPasswordComponent,
    ResetPasswordComponent,
    RegisterComponent

  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    HttpClientModule,
    FormsModule, 
    ReactiveFormsModule
  ]
})
export class UserModule { }
