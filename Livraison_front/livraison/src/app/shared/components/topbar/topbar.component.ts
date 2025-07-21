import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {
   @Output() sidebarToggled = new EventEmitter<void>(); // Renamed to avoid conflict
  isSearchExpanded = false;
isCollapsed = false; // At the top of the class


  searchQuery = '';

 isProfileDropdownOpen = false;

isMobileView = false;
@Input() isSidebarOpen: boolean = false;


     constructor(
       private userService: UserService,
       private router: Router
     ) {}

  @HostListener('window:resize', ['$event'])
  checkScreenSize(event?: Event) {
    this.isMobileView = window.innerWidth <= 769;
  }

     ngOnInit() {
    this.checkScreenSize();  // Initialize mobile detection
  }
  
  toggleProfileDropdown() {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
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
    this.router.navigate(['user/login']);
    this.isProfileDropdownOpen = false;
    
  }



  



}

