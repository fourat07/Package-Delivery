import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@Component({
  selector: 'app-scanner',
  standalone: true,
   imports: [CommonModule, FormsModule, ZXingScannerModule],
  template: `
    <h3>Scanner QR</h3>
    <zxing-scanner (scanSuccess)="onScan($event)"></zxing-scanner>

    <div *ngIf="scannedResult">✅ QR détecté : {{ scannedResult }}</div>
  `
})
export class ScannerComponent {
  scannedResult: string | null = null;

  constructor(private router: Router) {}

onScan(result: string) {
  this.scannedResult = result;

  try {
    const url = new URL(result);
    const params = url.searchParams;

    if (params.has('colisId')) {
      // Navigation vers le composant ScanColis
      this.router.navigate(['/scan/colis'], { queryParams: { colisId: params.get('colisId') } });
    } else if (params.has('livraisonId')) {
      this.router.navigateByUrl(`/scan/livraison?livraisonId=${params.get('livraisonId')}`);
    }
  } catch (e) {
    console.error('QR invalide', e);
  }
}

}
