import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:8081/dashboard';

  constructor(private http: HttpClient) {}

  getGlobalStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/global`);
  }

getRecettesParJourParLivreur(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/recettes-par-jour-livreur`);
}

  // 📦 Taux de réussite
  getTauxReussite(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/colis/taux-reussite`);
  }

  // ⏱️ Délai moyen
  getDelaiMoyen(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/colis/delai-moyen`);
  }

  getRecettesTotalesParClient(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/colis/recettes-clients`);
}

getRecettesParJourParClient(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/colis/recettes-par-jour-client`);
}


getColisLivresParLivreur(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/livreurs/colis-livres`);
}

getTauxReussiteParLivreur(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/livreurs/taux-reussite`);
}

getTourneesActives(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/livreurs/tournees-actives`);
}

getReclamationsStats(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/reclamations/stats`);
}


  getUsersByRole(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/by-role`);
  }

 


}
