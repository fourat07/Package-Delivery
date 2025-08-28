import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { UserProfileComponent } from './standelone/profile/user-profile.component';
import { ListColisComponent } from './standelone/colis/list-colis.component';
import { ColisFormComponent } from './standelone/colis-form/colis-form.component';
import { HistoriqueColisComponent } from './standelone/historique-colis/historique-colis.component';
import { ScanColisComponent } from './standelone/scan-colis/scan-colis.component';
import { ScanLivraisonComponent } from './standelone/scan-livraison/scan-livraison.component';
import { ScannerComponent } from './standelone/scanner/scanner.component';
import { LivraisonListComponent } from './standelone/livraison-list/livraison-list.component';
import { HistoriqueComponent } from './standelone/historique-statut/historique.component';
import { LivraisonDetailsComponent } from './standelone/livraison-details/livraison-details.component';
import { ListTourneeComponent } from './standelone/tournee/list-tournee.component';
import { DetailsTourneeComponent } from './standelone/details-tournee/details-tournee.component';
import { CreateTourneeComponent } from './standelone/create-tournee/create-tournee.component';
import { ListReclamationComponent } from './standelone/list-reclamation/list-reclamation.component';
import { CreateReclamationComponent } from './standelone/create-reclamation/create-reclamation.component';
import { DetailsReclamationComponent } from './standelone/dtails-reclamation/details-reclamation.component';
import { LoginComponent } from './features/user/components/login/login.component';
import { DashboardComponent } from './standelone/dasboard/dashboard.component';



const routes: Routes = [
  { path: 'user', loadChildren: () => import('./features/user/user.module').then(m => m.UserModule) },
    { path: 'user/login', component: LoginComponent , data: { hideNavbar: true } },

  {path: '',redirectTo: 'user/login',pathMatch: 'full'},



//Colis CRUD
  {path:'user-profile',component:UserProfileComponent,canActivate:[AuthGuard]},
  {path:'list-colis',component:ListColisComponent,canActivate:[AuthGuard]},
  {path:'add-colis',component:ColisFormComponent,canActivate:[AuthGuard]},
  {path:'edit-colis/:id',component:ColisFormComponent,canActivate:[AuthGuard]},
  {path:'historique-colis',component:HistoriqueColisComponent,canActivate:[AuthGuard]},
  { path: 'scanner', component: ScannerComponent ,canActivate:[AuthGuard]},
  { path: 'scan/colis', component: ScanColisComponent ,canActivate:[AuthGuard]},         
  { path: 'scan/livraison', component: ScanLivraisonComponent ,canActivate:[AuthGuard]},


//Livraison CRUD

  {path:'list-livraison',component:LivraisonListComponent,canActivate:[AuthGuard]},

  {path:'detatils-livraison/:id',component:LivraisonDetailsComponent,canActivate:[AuthGuard]},

  
  {path:'historique/:id',component:HistoriqueComponent,canActivate:[AuthGuard]},


  //TOURNEE && PICKUPS
    {path:'list-tournee',component:ListTourneeComponent,canActivate:[AuthGuard]},

  {path:'details-tournee/:id',component:DetailsTourneeComponent,canActivate:[AuthGuard]},
  {path:'create-tournee',component:CreateTourneeComponent,canActivate:[AuthGuard]},


  //RECLAMATION

  {path:'list-reclamation',component:ListReclamationComponent,canActivate:[AuthGuard]},
  {path:'create-reclamation',component:CreateReclamationComponent,canActivate:[AuthGuard]},
  {path:'details-reclamation/:id',component:DetailsReclamationComponent,canActivate:[AuthGuard]},


  //Dashboard 
  {path:'dashboard',component:DashboardComponent,canActivate:[AuthGuard]},


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
