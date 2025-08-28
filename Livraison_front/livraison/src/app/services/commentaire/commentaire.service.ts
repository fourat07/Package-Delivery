import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Commentaire } from 'src/app/core/models/Reclamation';

@Injectable({
  providedIn: 'root'
})
export class CommentaireService {

 private apiUrl = 'http://localhost:8081/commentaire';

  constructor(private http: HttpClient) {}

  getByReclamation(reclamationId: number): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.apiUrl}/reclamation/${reclamationId}`);
  }

  add(reclamationId: number, userId: number, contenu: string): Observable<Commentaire> {
    return this.http.post<Commentaire>(`${this.apiUrl}/add/${reclamationId}/${userId}`, { contenu });
  }

  updateComment(commentId: number, newContent: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/${commentId}`, { contenu: newContent });
}

}
