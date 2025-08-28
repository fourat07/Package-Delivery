import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Colis, HistoriqueItem } from 'src/app/core/models/colis';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css'], 
/*     template: `
    <div *ngIf="loading">Chargement de l'historique...</div>
    <div *ngIf="!loading && historique.length; else vide">
      <div class="timeline">
        <div *ngFor="let h of historique" class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="status-change">
              <span class="old-status">{{h.ancienStatut}}</span>
              <span class="arrow">→</span>
              <span class="new-status">{{h.nouveauStatut}}</span>
            </div>
            <div class="timeline-meta">
              <span class="date">{{h.dateChangement | date:'mediumDate'}}</span>
              <span class="time">{{h.dateChangement | date:'shortTime'}}</span>
            </div>
            <div *ngIf="h.changedBy" class="changed-by">Changed by: {{h.changedBy}}</div>
            <div *ngIf="h.commentaire" class="comment">{{h.commentaire}}</div>
          </div>
        </div>
      </div>
    </div>
    <ng-template #vide>
      <div class="no-history">No history available</div>
    </ng-template>
  ` */

})
export class HistoriqueComponent  {

  @Input() historique: HistoriqueItem[] = [];

  livraison: any = null;
  historiqueMap: Record<number, HistoriqueItem[]> = {};
  colisIds: number[] = [];
  loading = true;
  colisDetails: { [key: number]: Colis } = {}; 
    currentUserRole: string = '';


  constructor(private http: HttpClient,private route: ActivatedRoute,private authService: UserService) {}

  ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
      const id = params.get('id');  // correspond à /historique/:id
      if (id) {
        const livraisonId = Number(id);
        this.loadHistorique(livraisonId);
      } else {
        this.loading = false;
      }
    });

     const user = this.authService.getCurrentUser();
    this.currentUserRole = user?.role || '';
  }
loadHistorique(livraisonId: number): void {
  this.loading = true;
  this.http.get<any>(`http://localhost:8081/livraison/${livraisonId}/historique`)
    .subscribe({
      next: (res) => {
        this.livraison = {
          livraisonId: res.livraisonId,
          reference: res.reference
        };
        
        this.historiqueMap = {};
        this.colisDetails = {};

        // ✅ CORRECTED: The backend returns the historique array directly
  for (const colisId in res.colisHistoriques) {
  const numericId = Number(colisId);
  const colisData = res.colisHistoriques[colisId]; // ✅ objet complet
  
  const historiqueArray = colisData.historique || [];
  
  // Store historique entries
  this.historiqueMap[numericId] = historiqueArray.map((h: any) => ({
    ancienStatut: h.ancienStatut || 'Unknown',
    nouveauStatut: h.nouveauStatut || 'Unknown',
    dateChangement: h.dateChangement || new Date().toISOString(),
    changedBy: h.user?.username || 'System',
    commentaire: h.commentaire || ''
  }));

  // ✅ Maintenant tu peux récupérer aussi les détails du colis
  this.colisDetails[numericId] = {
    id: numericId,
    codeBarre: colisData.codeBarre,
    adresse: colisData.adresse,
    telephone: colisData.telephone,
    prix: colisData.prix,
    paiement: colisData.paiement,
    statut_colis: colisData.statut_colis,
    user: colisData.user || { username: 'Unknown' },
    frais_retour: colisData.user.frais_retour || 0
  } as unknown as Colis;
}

this.colisIds = Object.keys(res.colisHistoriques).map(id => Number(id));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading historique:', error);
        this.loading = false;
      }
    });
}
}
