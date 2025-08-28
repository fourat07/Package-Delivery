import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule, NgIfContext } from '@angular/common';
import { Reclamation, StatutReclamation } from 'src/app/core/models/Reclamation';
import { ReclamationService } from 'src/app/services/reclamation/reclamation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-list-reclamation',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './list-reclamation.component.html',
  styleUrls: ['./list-reclamation.component.css']
})
export class ListReclamationComponent implements OnInit {
   reclamations: Reclamation[] = [];
  filteredReclamations: Reclamation[] = [];
  StatutReclamation = StatutReclamation;


  agents: any[] = []; // list of agents from backend
selectedAgents: { [key: number]: number | null } = {};
  commentaires: { [key: number]: string } = {}; // map recId -> commentaire
statuts: StatutReclamation[] = Object.values(StatutReclamation);
selectedStatuts: { [key: number]: StatutReclamation } = {};
      currentUserRole: string = '';

        // 🔍 Recherche / filtre
  searchAgent: string = '';
  searchStatut: string = '';
  searchDate: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

        // 📌 Pagination
  currentPage: number = 1;
  pageSize: number = 10; // 5 réclamations par page



  constructor(
    private reclamationService: ReclamationService,
    private userService: UserService // you need a service to fetch agents
    ,private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReclamations();

    
     const user = this.userService.getCurrentUser()
    this.currentUserRole = user?.role || '';
  }


/* updateStatut(reclamationId: number, newStatut: string) {
  this.reclamationService.updateStatut(reclamationId, newStatut).subscribe({
    next: () => {
      this.loadReclamations(); // recharge la liste
      this.loadAgents();       // ⚡ recharge la dispo des agents
    },
    error: (err) => {
      console.error("Erreur lors de la mise à jour du statut", err);
    }
  });
} */

updateStatut(reclamationId: number, newStatut: string) {
  this.reclamationService.updateStatut(reclamationId, newStatut).subscribe({
    next: (updated) => {

      
      // ✅ mettre à jour le statut en local
      const reclamation = this.reclamations.find(r => r.id === reclamationId);
      if (reclamation) {
        reclamation.statut = newStatut as StatutReclamation
      }

      // ✅ Recalculer le compteur de l’agent
      if (updated.agentAttribue?.idUser) {
        this.reclamationService.getActiveReclamationsCount(updated.agentAttribue.idUser)
          .subscribe(count => {
            const agent = this.agents.find(a => a.idUser === updated.agentAttribue!.idUser);
            if (agent) {
              agent.nbReclamationsAssignees = count; // ⚡ compteur mis à jour
              agent.disponible = count < 3; // ⚡ dispo recalculée
            }
          });
      }
    },
    error: (err) => console.error(err)
  });
}


loadReclamations() {
  this.reclamationService.getAll().subscribe(data => {
    this.reclamations = data;

    // Pré-remplir les statuts actuels avec enum
    this.reclamations.forEach(r => {
      if (r.statut) {
      this.selectedStatuts = { ...this.selectedStatuts, [r.id!]: r.statut as StatutReclamation };
this.selectedAgents = { ...this.selectedAgents, [r.id!]: r.agentAttribue ? r.agentAttribue.idUser : null };

      }
    });

    // ✅ Appliquer filtre + tri APRÈS chargement
    this.applyFilters();
    this.sortReclamations();
    this.loadAgents();
  });
}

  loadAgents() {
    this.userService.getAgents().subscribe(data => this.agents = data);
  }

  assignAgent(reclamationId: number, agentId: number  | null) {
  if (!agentId) return;
  this.reclamationService.assignAgent(reclamationId, agentId).subscribe({
    next: () => {
      this.loadReclamations();
      this.loadAgents();
    },
    error: (err) => {
      alert("⚠️ Cet agent a déjà 3 réclamations assignées !");
    }
  });
}


  /* updateStatut(id: number, statut: string) {
    this.reclamationService.updateStatut(id, statut).subscribe(() => this.loadReclamations());
  } */

  delete(id: number) {
    this.reclamationService.delete(id).subscribe(() => this.loadReclamations());
  }

  navuigateToCreate() {
    // Logique de navigation vers le composant de création
    this.router.navigate(['create-reclamation']);

  }
 saveComment(reclamationId: number) {
  const contenu = this.commentaires[reclamationId];
  if (!contenu) return;

  const commentaire = { contenu: contenu };

  this.reclamationService.addComment(reclamationId, commentaire).subscribe(() => {
    this.loadReclamations(); // recharge la liste avec nouveaux commentaires
    this.commentaires[reclamationId] = ''; // reset input
  });
}

navigateToDetails(id: number) {
  this.router.navigate(['/details-reclamation', id]); // 👈 correspond à /reclamations/:id
}


  // 🔍 Filtrage dynamique
applyFilters(): void {
  this.filteredReclamations = this.reclamations.filter(r => {
    // 🔎 Filtre agent
    const matchAgent = !this.searchAgent || 
      (r.agentAttribue?.username?.toLowerCase().includes(this.searchAgent.toLowerCase()));

    // 🔎 Filtre statut (enum string)
    const matchStatut = !this.searchStatut || r.statut === this.searchStatut;

    // 🔎 Filtre date
    const dateCreation = r.dateCreation ? new Date(r.dateCreation) : null;
    const matchDate = !this.searchDate || (
      dateCreation && dateCreation.toISOString().split('T')[0] === this.searchDate
    );

    return matchAgent && matchStatut && matchDate;
  });
}



  // 📌 Pagination helpers
  get paginatedReclamations(): Reclamation[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredReclamations.slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredReclamations.length / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
    }
  }

 sortReclamations(): void {
  this.filteredReclamations.sort((a, b) => {
    const dateA = a.dateCreation ? new Date(a.dateCreation).getTime() : 0;
    const dateB = b.dateCreation ? new Date(b.dateCreation).getTime() : 0;

    return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

toggleSortDate(): void {
  this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  this.sortReclamations(); // ✅ seulement tri
}

}
