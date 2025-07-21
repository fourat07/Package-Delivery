import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
    animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})

export class NavbarComponent implements OnInit {
  dropdownOpen = false;
  username :string = ''; // Replace with actual username from your service
   notificationsCount = 3;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

ngOnInit() {
    // Get username from current user
    const user = this.userService.getCurrentUser();
    this.username = user?.username || 'Guest';
    
    // Or subscribe to changes if user can update while logged in
    this.userService.currentUser$.subscribe(user => {
      this.username = user?.username || 'Guest';
    });
  }

  toggleMenu() {
    this.dropdownOpen = !this.dropdownOpen;
  }

   // Close menu when clicking outside
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.navbar-user')) {
      this.dropdownOpen = false;
    }
  }
  logout() {
    this.userService.logout();
    this.router.navigate(['user/login']);
    this.dropdownOpen = false;
  }
}