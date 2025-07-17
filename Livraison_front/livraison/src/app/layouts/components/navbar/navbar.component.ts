import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  dropdownOpen = false;
  username :string = ''; // Replace with actual username from your service

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

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['user/login']);
    this.dropdownOpen = false;
  }
}