import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-userdetails',
  templateUrl: './userdetails.component.html',
  styleUrls: ['./userdetails.component.css']
})
export class UserdetailsComponent implements OnInit {
user: any;
  isLoading = true;
  error = '';
      currentUserRole: string = '';


  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    console.log("User ID:", userId);
    if (userId) { 
      this.userService.getUserDetails(+userId).subscribe(
        
        (response) => {
          this.user = response;
          this.isLoading = false;
        },
        (error) => {
          this.error = 'Failed to load user details';
          this.isLoading = false;
        }
      );
    }

     const user = this.userService.getCurrentUser();
    this.currentUserRole = user?.role || '';
  }


  isUserOnline(lastLogin: string | Date): boolean {
    if (!lastLogin) return false;
    
    const lastLoginDate = new Date(lastLogin);
    const now = new Date();
    const diffInMinutes = (now.getTime() - lastLoginDate.getTime()) / (1000 * 60);
    
    // Consider user online if last login was within 15 minutes
    return diffInMinutes < 15;
  }

  editUser(): void {
    // Implement your edit navigation logic here
    console.log('Edit user:', this.user.id);
    // Example: this.router.navigate(['/users', this.user.id, 'edit']);
  }


}
