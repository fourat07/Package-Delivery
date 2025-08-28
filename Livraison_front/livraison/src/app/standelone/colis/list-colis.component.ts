import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ColisService } from 'src/app/services/colis-service/colis-service.service';
import { Colis, Paiement } from 'src/app/core/models/colis';
import { Livraison } from 'src/app/core/models/livraison';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-list-colis',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './list-colis.component.html',
  styleUrls: ['./list-colis.component.css']
})
export class ListColisComponent implements OnInit {
  colisList: Colis[] = [];
  livraison?: Livraison;
  loading = false;
  errorMessage = '';

  selectedColis: number[] = [];
  qrBase64?: string;

  // 🔍 Recherche et filtres
  searchTerm: string = '';
  filterUsername: string = '';
  filterPaiement: string = '';
  uniqueUsernames: string[] = [];
  paiements = Object.values(Paiement); // ["CHEQUE","ESPECE","VIREMENT"]

    currentUserRole: string = '';
    successMessage: string = '';



  // 📄 Pagination
  currentPage: number = 1;
  itemsPerPage: number = 4;

  constructor(private colisService: ColisService, private http: HttpClient,private authService: UserService) {}

  ngOnInit(): void {
    this.loadColis();
     const user = this.authService.getCurrentUser();
    this.currentUserRole = user?.role || '';
  }

  loadColis(): void {
    this.loading = true;
    this.colisService.getAll().subscribe({
      next: (data) => {
        this.colisList = data;
        this.uniqueUsernames = [...new Set(data.map(c => c.user?.username))];
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des colis';
        console.error(err);
        this.loading = false;
      }
    });
  }

  deleteColis(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce colis ?')) {
      this.colisService.delete(id).subscribe({
        next: () => {
          this.colisList = this.colisList.filter(c => c.id !== id);
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de la suppression du colis');
        }
      });
    }
  }

  toggleSelection(colisId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;
    if (checked) {
      this.selectedColis.push(colisId);
    } else {
      this.selectedColis = this.selectedColis.filter(id => id !== colisId);
    }
  }

createLivraison() {
  this.http.post<any>('http://localhost:8081/livraison/create', this.selectedColis)
    .subscribe(res => {
      this.livraison = {
        id: res.id,
        reference: res.reference,
        codeBarre: res.codeBarre,
        colisList: res.colisList,
        dateCreation: new Date(res.dateCreation),
        colisCount: res.colisCount
      } as any;

      this.qrBase64 = res.qrCodeBase64 && res.qrCodeBase64 !== "" ? res.qrCodeBase64 : null;

      // ✅ Exclure les colis utilisés de la liste affichée
      this.colisList = this.colisList.filter(c => !this.selectedColis.includes(c.id!));

      // ✅ Réinitialiser la sélection
      this.selectedColis = [];

      // ✅ Décocher toutes les cases
      const checkboxes = document.querySelectorAll<HTMLInputElement>('table input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = false);

      // ✅ Afficher un message de succès
      this.successMessage = '🚚 Livraison créée avec succès !';
      setTimeout(() => this.successMessage = '', 4000);
    });
}


  downloadColisPdf(colisId: number) {
    window.open(`http://localhost:8081/pdf/colis/${colisId}`, "_blank");
  }

  downloadLivraisonPdf(id: number) {
    this.http.get(`http://localhost:8081/pdf/livraison/${id}`, { responseType: 'blob' })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `livraison-${id}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('PDF download failed:', err);
        }
      });
  }

  // 🔍 Filtrage dynamique
  get filteredColis(): Colis[] {
    return this.colisList.filter(colis => {
      const matchesSearch = this.searchTerm === '' ||
        colis.codeBarre?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        colis.adresse?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        colis.telephone?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesUsername = this.filterUsername === '' || colis.user?.username === this.filterUsername;
      const matchesPaiement = this.filterPaiement === '' || colis.paiement === this.filterPaiement;

      return matchesSearch && matchesUsername && matchesPaiement;
    });
  }

  // 📄 Pagination
  get totalPages(): number {
    return Math.ceil(this.filteredColis.length / this.itemsPerPage);
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginatedColis(): Colis[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredColis.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
