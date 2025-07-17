import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  message: string = '';
  isSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    
 
    }
 
    
  ngOnInit() {
    const encodedToken = this.route.snapshot.queryParamMap.get('token') || '';
  this.token = encodedToken;
  //console.log('Token from URL:', this.route.snapshot.queryParamMap.get('token'));

  if (!this.token) {
    this.message = 'Invalid reset link';
    setTimeout(() => this.router.navigate(['/user/login']), 3000);
  }
  }

  onSubmit() {
    if (!this.token) {
      this.message = 'Invalid reset token';
      return;
    }

    if (!this.newPassword || !this.confirmPassword) {
      this.message = 'Please enter and confirm your new password';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.message = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.message = '';
    
    this.http.post('http://localhost:8081/auth/reset-password', {
      token: this.token,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        this.message = 'Password reset successfully! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/user/login']), 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.message = error.error?.message || 'Failed to reset password';
        setTimeout(() => this.message = '', 5000); // Clear error after 5 seconds
      }
    });
  }
}