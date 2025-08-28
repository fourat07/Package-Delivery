import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ScanService } from 'src/app/services/scan/scan.service';
import { StatutColis } from 'src/app/core/models/colis';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-scan-colis',
  standalone: true,
 imports: [CommonModule, FormsModule, HttpClientModule],
    template: `
    <div *ngIf="loading">Chargement...</div>
    <div *ngIf="!loading && colis">
      <h2>Colis #{{colis.id}} — {{ colis.code }}</h2>

      <label>Changer statut</label>
      <select [(ngModel)]="selected">
        <option *ngFor="let s of statuts" [value]="s">{{s}}</option>
      </select>

      <label>Commentaire (facultatif)</label>
      <textarea [(ngModel)]="commentaire" rows="2" cols="30"></textarea>

      <button (click)="save()">💾 Enregistrer</button>

      <div *ngIf="saved">✅ Statut mis à jour</div>
    </div>
  `
})
export class ScanColisComponent implements OnInit{

statuts: StatutColis[] = Object.values(StatutColis);
  colis?: { id:number, code:string, statut:string };
  selected!: StatutColis;
  commentaire: string = '';
  loading = true;
  saved = false;

  constructor(private route: ActivatedRoute, private api: ScanService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('colisId');
    if (id) this.load(+id);
    else this.loading = false;
  }

  load(colisId: number) {
    this.api.getColis(colisId).subscribe(c => {
      this.colis = c;
      this.selected = c.statut as StatutColis;
      this.loading = false;
    });
  }

  save() {
    if (!this.colis) return;

    this.api.updateColisStatus(this.colis.id, this.selected, this.commentaire)
      .subscribe(() => {
        this.saved = true;
        setTimeout(() => this.saved = false, 1500);
        this.commentaire = '';
      });
  }
}
