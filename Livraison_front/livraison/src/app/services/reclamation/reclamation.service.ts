import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Reclamation } from 'src/app/core/models/Reclamation';



@Injectable({
  providedIn: 'root'
})




export class ReclamationService {

   private apiUrl = 'http://localhost:8081/reclamation';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(this.apiUrl);
  }

create(reclamation: Reclamation, clientId: number): Observable<Reclamation> {
  return this.http.post<Reclamation>(
    `${this.apiUrl}/create/${clientId}`,
    reclamation
  );
}


  assignAgent(reclamationId: number, agentId: number): Observable<Reclamation> {
  return this.http.put<Reclamation>(`${this.apiUrl}/${reclamationId}/assign/${agentId}`, {});
}


updateStatut(reclamationId: number, statut: string): Observable<Reclamation> {
  return this.http.put<Reclamation>(`${this.apiUrl}/${reclamationId}/statut?statut=${statut}`, {});
}

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

addComment(reclamationId: number, commentaire: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/${reclamationId}/commentaires`, commentaire);
}

getById(id: number): Observable<Reclamation> {
  return this.http.get<Reclamation>(`${this.apiUrl}/${id}/details`);
}

getActiveReclamationsCount(agentId: number): Observable<number> {
  return this.http.get<number>(`${this.apiUrl}/agents/${agentId}/count-actives`);
}



}
