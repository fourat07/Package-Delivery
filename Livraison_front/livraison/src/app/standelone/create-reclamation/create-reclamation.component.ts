import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reclamation } from 'src/app/core/models/Reclamation';
import { ReclamationService } from 'src/app/services/reclamation/reclamation.service';
import { UserService } from 'src/app/features/user/services/user/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-reclamation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-reclamation.component.html',
  styleUrls: ['./create-reclamation.component.css']
})
export class CreateReclamationComponent implements OnInit {

  newReclamation: Reclamation = {
    titre: '',
    description: '',
    statut: 'EN_ATTENTE'
  };

  currentUserRole: string = '';
  currentUser: any;

  constructor(
    private reclamationService: ReclamationService,
    private authService: UserService // <-- injecte ton service qui gère le user connecté
    ,private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();; // ou depuis localStorage
    this.currentUserRole = this.currentUser?.role || '';
    if (this.currentUserRole === 'ROLE_EXPEDITEUR' || this.currentUserRole === 'ROLE_ADMIN') {
      this.newReclamation.client = {
        idUser: this.currentUser.idUser,
        username: this.currentUser.username
      };
    }
          
      console.log("user",this.authService.getCurrentUser());
  }

  createReclamation() {
   /*  if (!this.newReclamation.client?.idUser) {
      console.error('Aucun client sélectionné !');
      return;
    } */

    this.reclamationService.create(this.newReclamation, this.newReclamation.client!.idUser).subscribe({
      next: (rec) => {
        console.log('Réclamation créée', rec);

        // Reset du formulaire
        this.newReclamation = {
          titre: '',
          description: '',
          statut: 'EN_ATTENTE',
          client: this.currentUserRole === 'ROLE_EXPEDITEUR' || 'ROLE_ADMIN'
            ? { idUser: this.currentUser.idUser, username: this.currentUser.username }
            : undefined
        };
      },
      error: (err) => {
        console.error('Erreur lors de la création', err);
      },
    });
    this.router.navigate(['/list-reclamation']);
  }

    cancel() {
    // ✅ Bouton annuler → retour sans sauvegarder
    this.router.navigate(['/list-reclamation']);
  }
}
