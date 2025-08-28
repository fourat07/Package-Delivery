import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LivraisonService } from 'src/app/services/livraison/livraison.service';
import { FormsModule } from '@angular/forms';
import { HistoriqueService } from 'src/app/services/historique/historique.service';
import { TimelineComponent } from "../timeline-colis/timeline.component";
import { HistoriqueItem } from 'src/app/core/models/colis';

@Component({
  selector: 'app-livraison-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TimelineComponent],
templateUrl: './livraison-details.component.html',
  styleUrls: ['./livraison-details.component.css']

})
export class LivraisonDetailsComponent implements OnInit{

 colisId!: number;
  historique: HistoriqueItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private historiqueService: HistoriqueService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('colisId');
    if (id) {
      this.colisId = +id;
      this.loadHistorique(this.colisId);
    }
  }

  loadHistorique(colisId: number) {
    this.historiqueService.getHistoriqueColis(colisId)
      .subscribe(hist => this.historique = hist);
  }
}
