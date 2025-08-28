import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoriqueColis } from 'src/app/core/models/colis';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-historique-colis',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './historique-colis.component.html',
  styleUrls: ['./historique-colis.component.css']
})
export class HistoriqueColisComponent {



  historique: HistoriqueColis[] = [];
  filtered: HistoriqueColis[] = [];
  searchColisId: string = "";

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<HistoriqueColis[]>("http://localhost:8081/colis/historique/all")
      .subscribe(data => {
        this.historique = data;
        this.filtered = data;
      });
  }

  filter() {
    if (this.searchColisId.trim() === "") {
      this.filtered = this.historique;
    } else {
      this.filtered = this.historique.filter(h => 
        h.colisId.toString().includes(this.searchColisId)
      );
    }
  }

}
