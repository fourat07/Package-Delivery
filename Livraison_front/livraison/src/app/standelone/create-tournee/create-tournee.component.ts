import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from 'src/app/core/models/colis';
import { Livraison } from 'src/app/core/models/livraison';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-create-tournee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-tournee.component.html',
  styleUrls: ['./create-tournee.component.css']
})
export class CreateTourneeComponent implements OnInit {

  livreurs: User[] = [];
  livraisons: Livraison[] = [];
  filteredLivraisons: Livraison[] = [];
  paginatedLivraisons: Livraison[] = [];
  
  selectedLivreurId: number | null = null;
  selectedLivraisons: number[] = [];
  loading = false;
  errorMessage = '';
  disponibleLivreurs: any[] = [];
  
  // Filtres et recherche
  searchDate: string = '';
  searchTime: string = '';
  filterExpediteur: string = '';
  uniqueExpediteurs: string[] = [];
  filterStatus: string = '';
searchExpediteur: string = ''; // si tu veux garder recherche textuelle par expediteur


  searchClient: string = "";
searchAdresse: string = "";
filterClient: string = "";
uniqueClients: string[] = [];

  
  // Tri
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 2;
  totalPages: number = 1;
  
  // Date validation
  selectedPickupDate: string = '';
  minDateTime: string = '';
  globalSearch: string = "";


  constructor(private http: HttpClient, private router: Router,private userService : UserService ) {}

  ngOnInit(): void {
    this.loadLivreurs();
    this.loadLivraisons();
    this.setMinDateTime();
    

  }

  setMinDateTime() {
    const now = new Date();
    // Format: YYYY-MM-DDTHH:MM
    this.minDateTime = now.toISOString().slice(0, 16);
  }

  isPickupDateInvalid(): boolean {
    if (!this.selectedPickupDate) return false;
    
    const selectedDate = new Date(this.selectedPickupDate);
    const now = new Date();
    
    return selectedDate < now;
  }

  loadLivreurs() {
    this.http.get<User[]>('http://localhost:8081/user/livreurs')
      .subscribe({
        next: data => this.livreurs = data,
        error: err => console.error(err)
      });
  }

loadLivraisons() {
  this.http.get<Livraison[]>('http://localhost:8081/livraison/pending')
    .subscribe({
      next: data => {
        this.livraisons = data.map(l => ({
          ...l,
          colisList: l.colisList || [],  
                         // sécurité
           // 👈 ajout du count
        }));

        this.extractUniqueExpediteurs();

        this.uniqueClients = [...new Set(
          this.livraisons.map(l => l.user?.username).filter(u => u)
        )] as string[];

        this.applyFilters();
      },
      error: err => console.error(err)
    });
}


  extractUniqueExpediteurs() {
    this.uniqueExpediteurs = [...new Set(
      this.livraisons
        .map(l => l.user?.username)
        .filter(username => username)
    )] as string[];
  }

applyFilters(): void {
  const searchClient = this.searchClient?.toLowerCase() || '';
  const searchAdresse = this.searchAdresse?.toLowerCase() || '';
  const global = this.globalSearch?.toLowerCase() || '';

  // 🔍 filtrer toutes les livraisons
  this.filteredLivraisons = this.livraisons.filter((l) => {
    const livraisonDate = l.dateCreation ? new Date(l.dateCreation) : null;

    const matchExpediteur = this.filterExpediteur
      ? l.user?.username === this.filterExpediteur
      : true;

    const matchDate = this.searchDate
      ? livraisonDate?.toISOString().slice(0, 10) === this.searchDate
      : true;

    const matchTime = this.searchTime
      ? livraisonDate?.toISOString().slice(11, 16) === this.searchTime
      : true;

    const matchStatus = this.filterStatus
      ? l.status === this.filterStatus
      : true;

    const matchClient = searchClient
      ? l.user?.username?.toLowerCase().includes(searchClient)
      : true;

    const matchAdresse = searchAdresse
      ? l.user?.adresse?.toLowerCase().includes(searchAdresse)
      : true;

    const matchGlobal = global
      ? (
          l.reference?.toLowerCase().includes(global) ||
          l.user?.username?.toLowerCase().includes(global) ||
          l.user?.adresse?.toLowerCase().includes(global) ||
          l.status?.toLowerCase().includes(global) ||
          l.colisCount?.toString().includes(global)
        )
      : true;

    return (
      matchExpediteur &&
      matchDate &&
      matchTime &&
      matchStatus &&
      matchClient &&
      matchAdresse &&
      matchGlobal
    );
  });

  // ✅ Tri
  this.filteredLivraisons.sort((a, b) => {
    const dateA = new Date(a.dateCreation || '').getTime();
    const dateB = new Date(b.dateCreation || '').getTime();
    return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // ✅ Garder la page courante, mais si la page n’existe plus → revenir à 1
  if ((this.currentPage - 1) * this.itemsPerPage >= this.filteredLivraisons.length) {
    this.currentPage = 1;
  }

  this.updatePagination();
}






  toggleSort() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applySort();
  }

  applySort() {
    this.filteredLivraisons.sort((a, b) => {
      const dateA = new Date(a.dateCreation || '').getTime();
      const dateB = new Date(b.dateCreation || '').getTime();
      
      return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredLivraisons.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedLivraisons = this.filteredLivraisons.slice(start, end);
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

 toggleLivraisonSelection(livraisonId: number, event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  
  if (checked) {
    if (!this.selectedLivraisons.includes(livraisonId)) {
      this.selectedLivraisons.push(livraisonId);
    }
  } else {
    this.selectedLivraisons = this.selectedLivraisons.filter(id => id !== livraisonId);
  }
}


  isSelected(livraisonId: number): boolean {
    return this.selectedLivraisons.includes(livraisonId);
  }

  createTournee() {
    if (this.isPickupDateInvalid()) {
      this.errorMessage = 'La date de pickup ne peut pas être dans le passé';
      return;
    }

    if (!this.selectedLivreurId || this.selectedLivraisons.length === 0 || !this.selectedPickupDate) {
      this.errorMessage = 'Veuillez sélectionner un livreur, des livraisons et la date de pickup';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      livraisonId: this.selectedLivraisons, // backend veut des strings apparemment
      datePickup: this.selectedPickupDate.slice(0,16)
    };

    this.http.post('http://localhost:8081/tournee/create', payload, {
      params: { livreurId: this.selectedLivreurId.toString() }
    }).subscribe({
      next: res => {
        this.loading = false;
        alert('Tournée créée avec succès !');
        this.router.navigate(['/list-tournee']);
      },
      error: err => {
        this.loading = false;
        console.error(err);
        this.errorMessage = 'Erreur lors de la création de la tournée';
      }
    });
  }

  getColisCount(livraison: Livraison): number {
    return livraison.colisList ? livraison.colisList.length : 0;
  }
}