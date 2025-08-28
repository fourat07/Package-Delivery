import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatutColis } from 'src/app/core/models/colis';

@Injectable({
  providedIn: 'root'
})
export class ScanService {

  private base = 'http://localhost:8081';

  constructor(private http: HttpClient) {}

  getColis(colisId: number): Observable<{id:number, code:string, statut:string}> {
    return this.http.get<{id:number, code:string, statut:string}>(`${this.base}/scan/colis`, { params: { colisId } });
  }

  updateColisStatus(colisId: number, statut: StatutColis, commentaire: string) {
    return this.http.patch(`${this.base}/scan/colis/${colisId}/statut`, {}, { params: { statut,commentaire } });
  }

  getLivraison(livraisonId: number) {
    return this.http.get<{id:number, code:string, statut:string}[]>(`${this.base}/scan/livraison`, { params: { livraisonId } });
  }

/*   updateColisFromLivraison(livraisonId: number, colisId: number, statut: StatutColis, commentaire: any) {
    return this.http.patch(`${this.base}/scan/livraison/${livraisonId}/colis/${colisId}/statut`, {}, { params: { statut,commentaire } });
  } */
// Angular service method example
updateColisFromLivraison(livraisonId: number, colisId: number, newStatus: string, comment?: string) {
  return this.http.patch(
    `${this.base}/scan/livraison/${livraisonId}/colis/${colisId}/statut`,
    {},
    { params: { statut: newStatus, commentaire: comment || '' } }
  );
}

}
