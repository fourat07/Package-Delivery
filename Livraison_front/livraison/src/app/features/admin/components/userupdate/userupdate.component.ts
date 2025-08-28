import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  
  Output,
  SimpleChanges,

} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-userupdate',
  templateUrl: './userupdate.component.html',
  styleUrls: ['./userupdate.component.css']
})
export class UserupdateComponent implements OnChanges, OnInit {
  @Input() user: any;
  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<any>();
  editing = true;

  model: any = {};
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  userid: any;

  

  constructor(private userService: UserService, private route: ActivatedRoute) {}
  ngOnInit(): void {

    this.isLoading = true;
    this.userid= this.route.snapshot.paramMap.get('id');
    this.userService.getUserDetails(this.userid).subscribe((res:any)=> {
      console.log('✅ User details fetched:', res)
      this.model = res;
      this.isLoading= false;

      ;})
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && changes['user'].currentValue && this.editing) {
      this.model = { ...changes['user'].currentValue };
      console.log('✅ Model initialized from ngOnChanges:', this.model);
    }
  }

  onRoleChange() {
    if (this.model.role !== 'ROLE_EXPEDITEUR') {
      this.model.frais_retour = null;
    }
  }

  save(form: NgForm) {
    if (form.invalid) return;

    if (!this.editing && this.model.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const userData = { ...this.model };

    if (this.editing) {
      delete userData.password;
    }

       
    this.userService.updateUser(this.model.idUser, userData).subscribe({
      next: (updatedUser) => {
        this.isLoading = false;
        this.userUpdated.emit(updatedUser);
        
        this.close.emit();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Une erreur est survenue';
        this.isLoading = false;
      }
    });
  }
}