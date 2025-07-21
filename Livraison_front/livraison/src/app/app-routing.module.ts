import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FooterComponent } from './layouts/components/footer/footer.component';

import { AuthGuard } from './guards/auth.guard';


const routes: Routes = [{ path: 'user', loadChildren: () => import('./features/user/user.module').then(m => m.UserModule) },
  { path: '', redirectTo: 'user/login', pathMatch: 'full' },
  
  //{ path: 'dashboard', component: DashboardComponent },
  //{ path: 'admin', component: AdminComponent ,canActivate: [AuthGuard],data: { expectedRole: 'ROLE_ADMIN' }},
  //{ path: 'livreur', component: LivreurComponent ,canActivate: [AuthGuard],data: { expectedRole: 'ROLE_LIVREUR' }},

  { path: 'admin', loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule), canActivate: [AuthGuard], data: { expectedRole: 'ROLE_ADMIN' } },
  { path: 'livreur', loadChildren: () => import('./features/livreur/livreur.module').then(m => m.LivreurModule), canActivate: [AuthGuard], data: { expectedRole: 'ROLE_LIVREUR' } },
  { path: 'agent', loadChildren: () => import('./features/agent/agent.module').then(m => m.AgentModule), canActivate: [AuthGuard], data: { expectedRole: 'ROLE_AGENT' } },
  { path: 'expediteur', loadChildren: () => import('./features/expediteur/expediteur.module').then(m => m.ExpediteurModule), canActivate: [AuthGuard], data: { expectedRole: 'ROLE_EXPEDITEUR' } },
  { path: 'comptable', loadChildren: () => import('./features/comptable/comptable.module').then(m => m.ComptableModule), canActivate: [AuthGuard], data: { expectedRole: 'ROLE_COMPTABLE' } }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
