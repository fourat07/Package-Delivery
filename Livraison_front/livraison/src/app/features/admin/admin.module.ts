import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from "@angular/material/icon";
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { NavbarComponent } from 'src/app/layouts/components/navbar/navbar.component';
import { ListUserComponent } from './components/list-user/list-user.component';
import { RegisterComponent } from '../user/components/register/register.component';
import { FormsModule } from '@angular/forms';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UserModule } from '../user/user.module';
import { UserdetailsComponent } from './components/userdetails/userdetails.component';
import { UserupdateComponent } from './components/userupdate/userupdate.component';
import { UserProfileComponent } from 'src/app/standelone/profile/user-profile.component';
import { ListColisComponent } from "src/app/standelone/colis/list-colis.component";


@NgModule({
  declarations: [
    AdminComponent,
    ListUserComponent,
    UserFormComponent,
    UserdetailsComponent,
    UserupdateComponent,
 
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    FormsModule,
    UserModule,
    UserProfileComponent,
    ListColisComponent
]
})
export class AdminModule { }
