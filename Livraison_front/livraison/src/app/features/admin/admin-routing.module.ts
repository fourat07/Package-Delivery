import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { ListUserComponent } from './components/list-user/list-user.component';
import { UserdetailsComponent } from './components/userdetails/userdetails.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { UserupdateComponent } from './components/userupdate/userupdate.component';


const routes: Routes = [{ path: '', component: AdminComponent },
  
  {path:'user-details/:id',component:UserdetailsComponent,canActivate:[AuthGuard]},
  {path:'user-update/:id',component:UserupdateComponent,canActivate:[AuthGuard]},


];
routes.push({ path: 'list', component: ListUserComponent },
  
);

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
