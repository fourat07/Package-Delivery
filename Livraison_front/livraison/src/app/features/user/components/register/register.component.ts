import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-register',
  
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  constructor(private userService: UserService, private router: Router) {}
 @Output() userAdded = new EventEmitter<void>();

  showModal = false;
  isLoading = false;
  registerError = '';
  passwordVisible = false;

  roles = ['ROLE_ADMIN', 'ROLE_CLIENT', 'ROLE_EXPEDITEUR'];

  user = {
    
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    adresse: '',
    role: '',
    frais_retour: 0
  };

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.user = {
      username: '',
      email: '',
      password: '',
      phoneNumber: '',
      adresse: '',
      role: '',
      frais_retour: 0
    };
    this.registerError = '';
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      this.registerError = '';

      // Call your backend API to register
      // Simulate request:

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

      setTimeout(() => {
        this.isLoading = false;
        this.userAdded.emit();
        this.closeModal();
      }, 1000);
    }
  }

/*   onSubmit(form: NgForm) {
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
  } */
}