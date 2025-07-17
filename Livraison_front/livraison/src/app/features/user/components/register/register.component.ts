import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    username: '',
    email: '',
    password: '',
    phoneNumber: ''
  };

  showPassword = false;
  isLoading = false;
  registerError = '';

  constructor(private userService: UserService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  getPasswordFieldType() {
    return this.showPassword ? 'text' : 'password';
  }

  getEyeIconClass() {
    return this.showPassword ? 'icon-eye-off' : 'icon-eye';
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    this.isLoading = true;
    this.registerError = '';

    this.userService.register(this.user).subscribe({
      next: (res) => {
        this.router.navigate(['/user/login'], {
          state: { registered: true }
        });
      },
      error: (err) => {
        this.registerError = err.error?.message || 'Registration failed';
        this.isLoading = false;
      }
    });
  }
}