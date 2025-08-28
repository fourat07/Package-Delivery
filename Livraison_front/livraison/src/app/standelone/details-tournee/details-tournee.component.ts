import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Tournee } from 'src/app/core/models/tournee';
import { Colis, HistoriqueItem, StatutColis } from 'src/app/core/models/colis';
import { FormsModule } from '@angular/forms';
import { HistoriqueService } from 'src/app/services/historique/historique.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-details-tournee',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './details-tournee.component.html',
  styleUrls: ['./details-tournee.component.css']
})
export class DetailsTourneeComponent implements OnInit {
  @Input() historique: HistoriqueItem[] = [];
   colisDetails: { [key: number]: Colis } = {}; 
colisIds: number[] = [];

  livraison: any = null;
historiqueMap: { [colisId: number]: any[] } = {};   tourneeId!: number;
  tournee?: Tournee;
  loading = true;
  searchTerm: string = '';
filteredLivraisons: any[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient,private historiqueService : HistoriqueService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tourneeId = +params['id'];
this.loadTourneeDetails(this.tourneeId);    });

  }

  applySearch() {
  if (!this.tournee) return;

  const term = this.searchTerm.toLowerCase();

  if (!term) {
    // si champ vide → réinitialiser
    this.filteredLivraisons = this.tournee.livraisons;
    return;
  }

  this.filteredLivraisons = this.tournee.livraisons.filter(l => {
    // recherche dans livraison
    const livraisonMatch =
      l.id.toString().includes(term) ||
      (l.reference && l.reference.toLowerCase().includes(term)) ||
      (l.status && l.status.toLowerCase().includes(term)) ||
      (l.user?.username && l.user?.username.toLowerCase().includes(term));

    // recherche dans colis
    const colisMatch = l.colisList.some(c =>
      c.id!.toString().includes(term) ||
      (c.codeBarre && c.codeBarre.toLowerCase().includes(term)) ||
      (c.adresse && c.adresse.toLowerCase().includes(term)) ||
      (c.telephone && c.telephone.toLowerCase().includes(term)) ||
      (c.prix && c.prix.toString().includes(term)) ||
      (c.paiement && c.paiement.toLowerCase().includes(term)) ||
      (c.statut_colis && c.statut_colis.toLowerCase().includes(term)) ||
      (c.user?.username && c.user.username.toLowerCase().includes(term)) ||

      // 🔎 recherche aussi dans historique
      (c.historique && c.historique.some((h: any) =>
        (h.ancienStatut && h.ancienStatut.toLowerCase().includes(term)) ||
        (h.nouveauStatut && h.nouveauStatut.toLowerCase().includes(term)) ||
        (h.changedBy && h.changedBy.toLowerCase().includes(term)) ||
        (h.commentaire && h.commentaire.toLowerCase().includes(term))
      ))
    );

    return livraisonMatch || colisMatch;
  });
}





downloadedLivraisons = new Set<number>(); // 👈 to track downloaded livraison IDs

downloadLivraisonPdf(id: number) {
  if (this.downloadedLivraisons.has(id)) {
    console.log(`PDF for livraison ${id} already downloaded`);
    return; // 👈 block duplicate downloads
  }

  this.downloadedLivraisons.add(id); // mark as downloaded

  // open browser download
  window.open(`http://localhost:8081/pdf/livraison/${id}`, '_blank');
}







downloadAllLivraisonsPdfs() {
  if (!this.tournee) return;

  this.tournee.livraisons.forEach(livraison => {
    this.downloadLivraisonPdf(livraison.id);
  });
}

loadTourneeDetails(id: number): void {
    this.loading = true;
    this.historiqueService.getTourneeDetailsWithHistorique(id).subscribe({
      next: (res) => {
        this.tournee = res;
        this.loading = false;
          this.filteredLivraisons = this.tournee.livraisons; // ✅ init filtré

      },
      error: (err) => {
        console.error('Erreur chargement tournée:', err);
        this.loading = false;
      }
    });
  }







  loadTournee(id: number) {
    this.loading = true;
    this.http.get<Tournee>(`http://localhost:8081/tournee/${id}`).pipe(
    map(res => ({
      ...res,
      livraisons: res.livraisons.map((l: any) => ({
        ...l,
        id: l.id,   // ✅ on mappe livraisonId vers id
        colisList: l.colisList.map((c: any) => ({
          ...c,
 id: c.id   // ✅ si c.id existe déjà on le garde, sinon on met colisId       
  }))
      }))
    }))
  );
  }

  updateColisStatus(livraisonId: number | undefined, colisId: number |undefined, newStatus: StatutColis) {
    this.http.put(`http://localhost:8081/livraison/${livraisonId}/colis/${colisId}/status`, { statut: newStatus })
      .subscribe({
        next: () => {
          if(this.tournee) {
            const livraison = this.tournee.livraisons.find(l => l.id === livraisonId);
            const colis = livraison?.colisList.find(c => c.id === colisId);
            if(colis) colis.statut_colis = newStatus;
          }
        },
        error: err => console.error(err)
      });
  }


/*   loadHistorique(livraisonId: number): void {
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
      } */

}
