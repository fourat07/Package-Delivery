import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Colis } from 'src/app/core/models/colis';

@Injectable({
  providedIn: 'root'
})
export class ColisService {

private apiUrl = 'http://localhost:8081';


  constructor(private http: HttpClient) {}

  getColisByCodeBarre(code: string): Observable<Colis> {
    return this.http.get<Colis>(`${this.apiUrl}/colis/code/${code}`);
  }



  updateStatut(id: number, statut: string, motif: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/colis/statut`, { statut, motif });
  }

    getAll(): Observable<Colis[]> {
          const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.get<Colis[]>(`${this.apiUrl}/colis/getAllColis`, { headers });
  }

  getById(id: number): Observable<Colis> {
    return this.http.get<Colis>(`${this.apiUrl}/colis/getColis/${id}`);
  }

  create(colis: Colis): Observable<Colis> {
    return this.http.post<Colis>(`${this.apiUrl}/colis/create`, colis);
  }

  update(id: number, colis: Colis): Observable<Colis> {
    return this.http.patch<Colis>(`${this.apiUrl}/colis/updateColis/${id}`, colis);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/colis/deleteColis/${id}`);
  
}

   createLivraison(colisIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/livraison/create`, colisIds);
  }



}
