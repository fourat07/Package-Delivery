import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LivraisonService {

  private base = 'http://localhost:8081';

  constructor(private http: HttpClient) {}

  create(colisIds: number[]) {
    return this.http.post<any>(`${this.base}/livraison/create`, colisIds);
  }

  list() {
    return this.http.get<any[]>(`${this.base}/livraison`);
  }

  details(id: number) {
    return this.http.get<any>(`${this.base}/livraison/${id}`);
  }

  updateItemStatus(livraisonId: number, colisId: number, statut: string) {
    return this.http.patch(`${this.base}/livraison/${livraisonId}/colis/${colisId}/statut`,
      null, { params: { statut } });
  }
}
