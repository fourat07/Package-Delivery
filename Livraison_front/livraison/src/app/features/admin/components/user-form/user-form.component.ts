import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { AbstractControl, NgForm, ValidationErrors, ValidatorFn } from '@angular/forms';
import { UserService } from 'src/app/features/user/services/user/user.service';
@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent {
  @Output() userAdded = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  isLoading = false;
  registerError = '';
  editing = false;

  confirmPassword = '';

  roles: string[] = [
    'ROLE_ADMIN',
    'ROLE_EXPEDITEUR',
    'ROLE_AGENT',
    'ROLE_LIVREUR'
  ];
  @Input() model: any = {
    idUser:'',
    username: '',
    email: '',
    phoneNumber: '',
    adresse: '',
    role: '',
    frais_retour: null,
    password: ''
  };



  constructor(private userService: UserService, private router: Router) {}

  onRoleChange() {
    if (this.model.role !== 'ROLE_EXPEDITEUR') {
      this.model.frais_retour = null;
    }
  }

 save(form: NgForm) {
  if (form.valid) {
    if (this.model.password !== this.confirmPassword) {
      this.registerError = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.registerError = '';

    this.userService.register(this.model).subscribe({
      next: () => {

        console.log('User registered successfully', );
        this.isLoading = false;
        this.userAdded.emit();
        this.close.emit();
      },
      error: (err) => {
        this.registerError = err.error?.message || 'Registration failed';
        this.isLoading = false;
      }
    });
  }
}
}

