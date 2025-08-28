import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HistoriqueItem } from 'src/app/core/models/colis';
import { Tournee } from 'src/app/core/models/tournee';

@Injectable({
  providedIn: 'root'
})
export class HistoriqueService {

  private base = 'http://localhost:8081/';
  constructor(private http: HttpClient) {}

 

 

  getHistoriqueColis(colisId: number): Observable<HistoriqueItem[]> {
    return this.http.get<HistoriqueItem[]>(`${this.base}/${colisId}colis/historique`);
  }

  getHistoriqueLivraison(livraisonId: number): Observable<HistoriqueItem[]> {
    return this.http.get<HistoriqueItem[]>(`${this.base}colis/livraison/${livraisonId}/historique`);
  }

    getTourneeDetailsWithHistorique(id: number): Observable<Tournee> {
    return this.http.get<Tournee>(`${this.base}historique/${id}/details-with-historique`);
  }
  
}
