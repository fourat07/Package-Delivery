import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoriqueItem } from 'src/app/core/models/colis';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
    template: `
      <div *ngIf="historique?.length; else vide">
        <div *ngFor="let h of historique; let i = index" class="timeline-item">
          <div class="dot"></div>
          <div class="content">
            <strong>{{h.ancienStatut}}</strong> → <strong>{{h.nouveauStatut}}</strong>
            <span class="date">[{{h.dateChangement | date:'short'}}]</span>
            <div *ngIf="h.changedBy">Par: {{h.changedBy}}</div>
            <div *ngIf="h.commentaire">Commentaire: {{h.commentaire}}</div>
          </div>
        </div>
      </div>
      <ng-template #vide>
        <div>Aucun historique disponible.</div>
      </ng-template>
    `,
    styles: [`
      .timeline-item { display:flex; margin-bottom:12px; align-items:flex-start; }
      .dot { width:10px; height:10px; background:#007bff; border-radius:50%; margin-right:8px; margin-top:6px; }
      .content { background:#f1f1f1; padding:6px 12px; border-radius:4px; flex:1; }
      .date { font-size:0.8em; color:#555; margin-left:6px; }
    `]
    
})
export class TimelineComponent {
  @Input() historique: HistoriqueItem[] = [];
}
