import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScanService } from 'src/app/services/scan/scan.service';

@Component({
  selector: 'app-create-livraison',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Créer une livraison globale</h2>

    <div *ngFor="let c of colisList">
      <input type="checkbox" [(ngModel)]="c.selected">
      #{{c.id}} — {{c.code}}
    </div>

    <button (click)="createLivraison()">Créer Livraison</button>

    <div *ngIf="qrBase64">
      <h3>QR Code Global</h3>
      <img [src]="'data:image/png;base64,' + qrBase64"/>
    </div>
  `,
  templateUrl: './create-livraison.component.html',
  styleUrls: ['./create-livraison.component.css']
})
export class CreateLivraisonComponent   {
  colisList: any[] = [];
  qrBase64?: string;

  constructor(private api: ScanService) {}
/* 
  ngOnInit(): void {
    this.api.getAllColis().subscribe(list => {
      // ajouter un flag selected
      this.colisList = list.map(c => ({ ...c, selected: false }));
    });
  }

  createLivraison() {
    const selectedIds = this.colisList.filter(c => c.selected).map(c => c.id);
    if (selectedIds.length === 0) return;

    this.api.createLivraison(selectedIds).subscribe(res => {
      this.qrBase64 = res.qrCodeBase64;
      alert("Livraison créée avec succès !");
    });
  } */
}

