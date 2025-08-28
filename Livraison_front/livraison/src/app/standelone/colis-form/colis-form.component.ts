import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Colis, Paiement, StatutColis } from 'src/app/core/models/colis';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ColisService } from 'src/app/services/colis-service/colis-service.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-colis-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './colis-form.component.html',
  styleUrls: ['./colis-form.component.css']
})
export class ColisFormComponent implements OnInit {

  colisForm!: FormGroup;
  isEditMode = false;
  colisId?: number;

  statutList = Object.values(StatutColis);
  paiementList = Object.values(Paiement);

  constructor(
    private fb: FormBuilder,
    private colisService: ColisService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
  this.colisForm = this.fb.group({
  adresse: ['', [Validators.required, Validators.minLength(5)]],
  telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
  prix: [0, [Validators.required, Validators.min(1)]],
  paiement: ['', Validators.required],
  nbArticle: [1, [Validators.required, Validators.min(1)]],
  remarque: [''],
  codeBarre: [''],
  statut: ['']
});


    // Vérifie si on est en mode édition
    this.colisId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.colisId) {
      this.isEditMode = true;
      this.colisService.getById(this.colisId).subscribe({
        next: (colis) => this.colisForm.patchValue(colis),
        error: (err) => console.error(err)
      });
    }
  }

  // raccourci pour accéder aux contrôles depuis le template
  get f() {
    return this.colisForm.controls;
  }

  onSubmit(): void {
    if (this.colisForm.invalid) {
      this.colisForm.markAllAsTouched();
      return;
    }

    const colis: Colis = this.colisForm.value;

    if (this.isEditMode) {
      this.colisService.update(this.colisId!, colis).subscribe({
        next: () => {
          alert('Colis mis à jour avec succès');
          this.router.navigate(['/list-colis']);
        },
        error: (err) => console.error(err)
      });
    } else {
      this.colisService.create(colis).subscribe({
        next: () => {
          alert('Colis créé avec succès');
          this.router.navigate(['/list-colis']);
        },
        error: (err) => console.error(err)
      });
    }
  }

}
