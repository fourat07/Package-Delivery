import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {
   @Output() sidebarToggled = new EventEmitter<void>(); // Renamed to avoid conflict
   @Input() user: any;
   
  isSearchExpanded = false;
isCollapsed = false; // At the top of the class


  searchQuery = '';

 isProfileDropdownOpen = false;

isMobileView = false;
  userid: any;
  model: any = {};
  isLoading = false;



@Input() isSidebarOpen: boolean = false;


     constructor(
       private userService: UserService,
       private route: ActivatedRoute
     ) {}

  @HostListener('window:resize', ['$event'])
  checkScreenSize(event?: Event) {
    this.isMobileView = window.innerWidth <= 1250;
  }

     ngOnInit() {
    this.checkScreenSize();  // Initialize mobile detection
      console.log('User photo:', this.userService.getCurrentUser()?.photo); // Debug log

 
  }
  
  toggleProfileDropdown() {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    console.log('dropdown toggled:', this.isProfileDropdownOpen); // Debug log
  }
  toggleSidebar() {
    this.sidebarToggled.emit();
    console.log('Navbar: Event emitted'); // Debug log 2
  }

    toggleSearch() {
   
      if (this.isMobileView) {
    this.isSearchExpanded = true; // or toggle if needed
  } else {
    this.isSearchExpanded = !this.isSearchExpanded;
  }

  
    
  }
   onLogout() {
    this.userService.logout();
    
    this.isProfileDropdownOpen = false;
    
  }


getProfileImage(): string {
  const user = this.userService.getCurrentUser();
  const photo = user?.photo;

  if (!user || !photo) {
    return 'assets/images/default.png';
  }

  return `http://localhost:8081/user/uploads/profile_photos/${photo}`;
}

handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = 'assets/images/default.png';
}



  



}

