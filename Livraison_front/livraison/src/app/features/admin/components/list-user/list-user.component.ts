import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-list-user',
  templateUrl: './list-user.component.html',
  styleUrls: ['./list-user.component.css']
})
export class ListUserComponent implements OnInit {



 searchTerm = '';
  filterRole = '';
  roles = ['ROLE_ADMIN', 'ROLE_AGENT', 'ROLE_EXPEDITEUR', 'ROLE_LIVREUR'];
  isTableView = false;
  showForm = false;


  currentPage = 1;
  itemsPerPage = 3;
  maxVisiblePages = 5

   showUserUpdate = false;
filterDisponibilite: string = ''; // "true", "false" ou ""

  /* dummy – replace with real API call */
  users: any[] = []; 

  selectedUser: any ;
  constructor(private userService: UserService, private router:Router) { }

 ngOnInit(): void {
    this.loadUsers();
    console.log('✅ Users loaded:', this.users);
  }

  


openUpdateModal(user: any) {
  
  this.selectedUser = user;
  console.log("Selected User ID:", this.selectUser); // Debug log
  this.showUserUpdate = true;
  console.log("✅ Selected user:", user); // doit contenir idUser
}


onUserUpdated(updatedUser: any) {
  // Mettre à jour la liste des utilisateurs
  const index = this.users.findIndex(u => u.id === updatedUser.idUser);
  if (index !== -1) {
    this.users[index] = updatedUser;
  }
  this.showUserUpdate = false;
}


loadUsers() {
  this.userService.getAllUsers().subscribe({
      next: data => this.users = data,
      error: err => console.error('Error fetching users:', err)
    });
}
  
/* viewDetails(userId: number) {
    this.router.navigate(['/user-details', userId]); // Adjust the route as needed

  console.log('View details for user ID:', userId);
}
 */
/* deleteUser(userId: number ): void {
     
  this.userService.deleteUser(userId).subscribe({
    next: () => {
      this.users = this.users.filter(user => user.id !== userId);
      console.log('User deleted successfully');
    },
    error: err => console.error('Error deleting user:', err)
  });
} */

  selectUser(user: any) {
  this.selectedUser = user;
  console.log("Selected User ID:", user.id); // Debug log
}



  filteredUsers() {
  let result = [...this.users];

  // 🔍 Recherche globale
  if (this.searchTerm.trim()) {
    const search = this.searchTerm.toLowerCase();
    result = result.filter(u =>
      (u.username && u.username.toLowerCase().includes(search)) ||
      (u.email && u.email.toLowerCase().includes(search)) ||
      (u.phoneNumber && u.phoneNumber.toLowerCase().includes(search)) ||
      (u.adresse && u.adresse.toLowerCase().includes(search)) ||
      (u.role && u.role.toLowerCase().includes(search)) ||
      // ✅ dispo (converti en texte "oui"/"non")
      (u.role === 'ROLE_LIVREUR' && 
        (u.disponible ? 'oui' : 'non').includes(search))
    );
  }

  // 🎯 Filtre par rôle
  if (this.filterRole) {
    result = result.filter(u => u.role === this.filterRole);
  }

  // 🎯 Filtre par disponibilité
  if (this.filterDisponibilite !== '') {
  const dispo = this.filterDisponibilite === 'true';
  result = result.filter(
    u => (u.role === 'ROLE_LIVREUR' || u.role === 'ROLE_AGENT') && u.disponible === dispo
  );
}


  return result;
}



  paginatedUsers() {
  const filtered = this.filteredUsers();
  //console.log('Filtered Users:', filtered); // Debug log
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  return filtered.slice(startIndex, endIndex);
}
  hasExpediteur() { return this.users.some(u => u.role === 'ROLE_EXPEDITEUR'); }
  hasLivreur() { return this.users.some(u => u.role === 'ROLE_LIVREUR'); }
  hasAgent() { return this.users.some(u => u.role === 'ROLE_AGENT'); }
  



  // Pagination controls
  get totalPages(): number {
    return Math.ceil(this.filteredUsers().length / this.itemsPerPage);
  }

  getPages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;
    const maxVisible = this.maxVisiblePages;
    
    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      const half = Math.floor(maxVisible / 2);
      let start = current - half;
      let end = current + half;
      
      if (start < 1) {
        start = 1;
        end = maxVisible;
      } else if (end > total) {
        end = total;
        start = total - maxVisible + 1;
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    
    return pages;
  }

  // Change page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Handle items per page change
  onItemsPerPageChange(): void {
    this.currentPage = 1; // Reset to first page when changing items per page
  }




  // Handle user deletion
deleteUser(userId: number): void {
  
  if (confirm('Are you sure you want to delete this user?')) {
    this.userService.deleteUser(userId).subscribe({
      
      
      next: () => {
         console.log('before', this.users);
        this.users = this.users.filter(u => u.idUser !== userId);
        console.log('after', this.users);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
          
          
          
        }
        console.log('User deleted successfully'); 
      },
      error: err => console.error('Error deleting user:', err)
    });
  }
}


  // Handle new user addition
  onUserAdded(newUser: any): void {
    this.users.push(newUser);
     this.loadUsers();
    this.showForm = false;
    // You might want to reset to first page or last page depending on your preference
    this.currentPage = this.totalPages;
  }
handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = 'assets/images/default.jpg'; // image de secours
}


getProfileImage(): string {
  const user = this.userService.getCurrentUser();
  const photo = user?.photo;

  if (!user || !photo) {
    return 'assets/images/default.png';
  }

  return `http://localhost:8081/user/uploads/profile_photos/${photo}`;
}
 

}
