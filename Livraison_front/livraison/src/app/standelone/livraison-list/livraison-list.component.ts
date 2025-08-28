import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LivraisonService } from 'src/app/services/livraison/livraison.service';
import { HistoriqueItem } from 'src/app/core/models/colis';
import { HttpClient } from '@angular/common/http';
import { TimelineComponent } from '../timeline-colis/timeline.component';
import { HistoriqueComponent } from '../historique-statut/historique.component';
import { ScannerComponent } from "../scanner/scanner.component";
import { FormsModule } from '@angular/forms';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-livraison-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ScannerComponent,FormsModule],
  templateUrl: './livraison-list.component.html',
  styleUrls: ['./livraison-list.component.css']
    /* template: `
    <h2>Liste des livraisons</h2>
    <ul>
      <li *ngFor="let l of livraisons">
        Livraison #{{l.id}} - {{l.reference}} - {{l.colisCount}} colis
        <button (click)="consulterHistorique(l)">Voir historique</button>
      </li>
    </ul>

    <div *ngIf="livraisonSelectionnee">
      <h3>Historique Livraison #{{livraisonSelectionnee.id}}</h3>
      <div *ngFor="let colis of livraisonSelectionnee.colisList">
        <h4>Colis #{{colis.id}} - {{colis.codeBarre}}</h4>
        <app-timeline [historique]="historiqueMap[colis.id]"></app-timeline>
      </div>
    </div>
  ` */
})
export class LivraisonListComponent implements OnInit {
    
 livraisons: any[] = [];
  filteredLivraisons: any[] = [];

  // 🔍 Recherche
  searchTerm: string = '';

  // 📅 Tri par date
  sortDirection: 'asc' | 'desc' = 'asc';

  // 📅 Filtre par date
  fromDate: string = '';
  toDate: string = '';

  // 📄 Pagination
  currentPage: number = 1;
  itemsPerPage: number = 4;

  showScanner = false;
    currentUserRole: string = '';


  constructor(private http: HttpClient, private router: Router,private authService: UserService) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:8081/livraison')
      .subscribe(data => {
        this.livraisons = data;
        console.log("✅ Livraisons chargées :", this.livraisons);
        this.applyFilters();
      });

       const user = this.authService.getCurrentUser();
    this.currentUserRole = user?.role || '';
  }

  // ✅ Appliquer recherche + tri + filtre date + pagination
 // ✅ Appliquer recherche + tri + filtre date + pagination
applyFilters() {
  let result = [...this.livraisons];

  // 🔍 Recherche globale (référence, client, statut, nombre de colis)
  if (this.searchTerm.trim()) {
    const search = this.searchTerm.toLowerCase();

    result = result.filter(l =>
      (l.reference && l.reference.toLowerCase().includes(search)) ||
      (l.user && l.user.toLowerCase().includes(search)) ||
      (l.status && l.status.toLowerCase().includes(search)) ||
      (l.colisCount && l.colisCount.toString().includes(search)) ||
      (l.dateCreation && new Date(l.dateCreation).toLocaleDateString().toLowerCase().includes(search))
    );
  }

  // 📅 Filtre par date (si fromDate / toDate renseignés)
  if (this.fromDate) {
    const from = new Date(this.fromDate).getTime();
    result = result.filter(l => new Date(l.dateCreation).getTime() >= from);
  }
  if (this.toDate) {
    const to = new Date(this.toDate).getTime();
    result = result.filter(l => new Date(l.dateCreation).getTime() <= to);
  }

  // 📅 Tri par date
  result.sort((a, b) => {
    const dateA = new Date(a.dateCreation).getTime();
    const dateB = new Date(b.dateCreation).getTime();
    return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });

  this.filteredLivraisons = result;
}


  // 🔄 Changer l’ordre de tri
  toggleSortOrder() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  // 📄 Pagination
  get paginatedLivraisons() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredLivraisons.slice(start, start + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredLivraisons.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // 📷 Scanner
  toggleScanner() {
    this.showScanner = !this.showScanner;
  }

  handleScan(result: string) {
    console.log("✅ Code scanné :", result);
    this.showScanner = false;
  }

  // 👁️ Voir historique
  voirHistorique(livraisonId: number) {
    this.router.navigate(['/historique', livraisonId]);
  }

  // 🗑️ Supprimer
  deleteLiv(livraisonId: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette livraison ?')) {
      this.http.delete(`http://localhost:8081/livraison/delete/${livraisonId}`).subscribe({
        next: () => {
          this.livraisons = this.livraisons.filter(l => l.id !== livraisonId);
          this.applyFilters();
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de la suppression de la livraison');
        }
      });
    }
  }
  createTournee() {
    this.router.navigate(['/create-tournee']);
  }
}
