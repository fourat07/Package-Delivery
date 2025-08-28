import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ScanService } from 'src/app/services/scan/scan.service';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Colis, HistoriqueItem, StatutColis } from 'src/app/core/models/colis';

@Component({
selector: 'app-scan-livraison',
standalone: true,
imports: [CommonModule, FormsModule, HttpClientModule],
templateUrl: './scan-livraison.component.html',
styleUrls: ['./scan-livraison.component.css']
})
export class ScanLivraisonComponent implements OnInit {
 livraisonId!: number;
  list: any[] = [];
  loading = true;
  statuts: StatutColis[] = Object.values(StatutColis);




   @Input() historique: HistoriqueItem[] = [];
   livraison: any = null;
  historiqueMap: Record<number, HistoriqueItem[]> = {};
  colisIds: number[] = [];
    colisDetails: { [key: number]: Colis } = {}; 




  constructor(private route: ActivatedRoute, private api: ScanService,private http: HttpClient) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('livraisonId');
      if (id) {
        this.livraisonId = +id;
        this.loadLivraison(this.livraisonId);
      } else {
        this.loading = false;
      }
    });

    console.log('Loading historique for livraisonId:', this.livraisonId);

    this.loadHistorique(this.livraisonId);




    


  }

  loadLivraison(id: number) {
    this.api.getLivraison(id).subscribe(arr => {
      this.list = arr.map(c => ({ ...c, _saved: false, commentaire: '' }));
      this.loading = false;
    });
  }

  save(colis: any) {
    this.api.updateColisFromLivraison(this.livraisonId, colis.id, colis.statut, colis.commentaire)
      .subscribe(() => {
        colis._saved = true;
        setTimeout(() => colis._saved = false, 1200);
        colis.commentaire = '';
      });
  }

getFilteredStatuts(currentStatut: string): string[] {
  return this.statuts.filter(stat => stat !== currentStatut);
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
