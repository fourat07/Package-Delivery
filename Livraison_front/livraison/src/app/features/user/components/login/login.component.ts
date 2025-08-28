import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  //encapsulation: ViewEncapsulation.ShadowDom
})
export class LoginComponent implements OnInit {
  credentials = {
    username: '',
    password: ''
  };
  
  isLoading = false;
  showPassword = false;
  loginError = '';

  constructor(private authService: UserService, private router: Router) {}
  ngOnInit(): void {
  }

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
  this.loginError = '';

  this.authService.login(this.credentials).subscribe({
    next: (response) => {
      const token = response.token;

      if (token) {
        const role = this.parseJwt(token)?.role;
        this.redirectBasedOnRole(role); // ✅ une seule méthode
      }
    },
    error: () => {
      this.loginError = 'Invalid username or password';
      this.isLoading = false;
    }
  });
}

private redirectBasedOnRole(role: string) {
  switch (role) {
    case 'ROLE_ADMIN':
      this.router.navigate(['/dashboard']); // admin
      break;
    case 'ROLE_LIVREUR':
      this.router.navigate(['/list-tournee']); // livreur
      break;
    case 'ROLE_AGENT':
      this.router.navigate(['/list-reclamation']); // agent
      break;
    case 'ROLE_EXPEDITEUR':
      this.router.navigate(['/list-colis']); // expediteur
      break;
    case 'ROLE_COMPTABLE':
      this.router.navigate(['/comptable']); // comptable
      break;
    default:
      this.router.navigate(['/']); // fallback -> home ou login
  }
}


  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }
}