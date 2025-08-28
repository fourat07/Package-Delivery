import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Tournee } from 'src/app/core/models/tournee';
import { ScannerComponent } from "../scanner/scanner.component";
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-list-tournee',
  standalone: true,
  imports: [CommonModule, FormsModule, ScannerComponent],
  templateUrl: './list-tournee.component.html',
  styleUrls: ['./list-tournee.component.css']
})
export class ListTourneeComponent implements OnInit {
  tournees: Tournee[] = [];
  filteredTournees: Tournee[] = [];
  paginatedTournees: Tournee[] = [];

  loading = true;
  errorMessage = '';
  showScanner = false;
  currentUserRole: string = '';

  // Filtres
  filterStatus: string = '';
  filterUsername: string = '';
  filterDate: string = '';
  isInvalidDate: boolean = false;
  minDate: string = ''; // Nouvelle propriété pour la date minimum

  // Propriétés pour les options de filtre
  uniqueStatuses: string[] = [];
  uniqueLivreurs: string[] = [];

  // Tri
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 4;
  totalPages: number = 1;
  filterAdresse: string = '';
  globalSearch: string = '';



  constructor(private http: HttpClient, private router: Router, private authService: UserService) {}

  ngOnInit(): void {
    this.loadTournees();
    const user = this.authService.getCurrentUser();
    this.currentUserRole = user?.role || '';
     this.setMinDate(); // Initialiser la date minimum
  }

    setMinDate() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  // 📷 Scanner
  toggleScanner() {
    this.showScanner = !this.showScanner;
  }

  loadTournees() {
    this.loading = true;
    this.http.get<Tournee[]>('http://localhost:8081/tournee')
      .subscribe({
        next: data => {
          this.tournees = data;
          this.extractFilterOptions();
          this.applyFilters();
          this.loading = false;
        },
        error: err => {
          this.errorMessage = 'Erreur lors du chargement des tournées';
          console.error(err);
          this.loading = false;
        }
      });
  }

  // Extraire les options de filtre uniques
  extractFilterOptions() {
    // Extraire les statuts uniques
    this.uniqueStatuses = [...new Set(this.tournees.map(t => t.status))].filter(s => s);
    
    // Extraire les noms de livreurs uniques
    this.uniqueLivreurs = [...new Set(this.tournees
      .map(t => t.livreur?.username)
      .filter(username => username))] as string[];
  }

  // 🎯 Filtres + recherche

applyFilters() {
  const search = this.globalSearch.toLowerCase();

  this.filteredTournees = this.tournees.filter(t => {
    // Champs utilisés pour la recherche
    const status = t.status?.toLowerCase() || '';
    const username = t.livreur?.username?.toLowerCase() || '';
    const adresse = t.livreur?.adresse?.toLowerCase() || '';
    const adressePickup = t.adressePickup?.toLowerCase() || '';
    const datePickup = t.datePickup ? new Date(t.datePickup).toISOString().split('T')[0] : '';

    // ✅ Recherche globale
    const matchSearch = search
      ? status.includes(search) 
        || username.includes(search) 
        || adresse.includes(search) 
        || adressePickup.includes(search) 
        || datePickup.includes(search)
      : true;

    // ✅ Filtre par statut
    const matchStatus = this.filterStatus ? t.status === this.filterStatus : true;

    // ✅ Filtre par username
    const matchUsername = this.filterUsername ? t.livreur?.username === this.filterUsername : true;

    // ✅ Filtre par date (exacte)
    const matchDate = this.filterDate ? datePickup === this.filterDate : true;

    // ⚡ Retourner VRAI seulement si tous les filtres passent
    return matchSearch && matchStatus && matchUsername && matchDate;
  });

  this.applySort();
}




  // Vérifier si la date de filtre est antérieure à aujourd'hui
  isFilterDateInvalid(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const filterDateObj = new Date(this.filterDate);
    filterDateObj.setHours(0, 0, 0, 0);
    
    return filterDateObj < today;
  }


  // Vérifier si la date est valide (non antérieure à aujourd'hui)
  isDateValid(dateString: string): boolean {
    if (!dateString) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remettre à minuit pour la comparaison
    
    const tourneeDate = new Date(dateString);
    tourneeDate.setHours(0, 0, 0, 0);
    
    return tourneeDate >= today;
  }
  // 🔀 Tri
  toggleSortDate() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applySort();
  }

  applySort() {
    this.filteredTournees.sort((a, b) => {
      const dateA = new Date(a.datePickup).getTime();
      const dateB = new Date(b.datePickup).getTime();
      return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

    this.updatePagination();
  }

  // 📑 Pagination
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredTournees.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedTournees = this.filteredTournees.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  // Méthode pour changer de page directement
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  viewTournee(id: number) {
    this.router.navigate(['/details-tournee/', id]);
  }

  deleteTournee(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cette tournée ?')) {
      this.http.delete(`http://localhost:8081/tournee/${id}`)
        .subscribe({
          next: () => {
            this.tournees = this.tournees.filter(t => t.id !== id);
            this.extractFilterOptions();
            this.applyFilters();
          },
          error: err => console.error(err)
        });
    }
  }

  createTournee() {
    this.router.navigate(['/create-tournee']);
  }
}