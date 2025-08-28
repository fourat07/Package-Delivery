import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // --- Chart Types
  colisChartType: ChartType = 'pie';
  livraisonChartType: ChartType = 'doughnut';
  tourneeChartType: ChartType = 'pie';
  tauxReussiteChartType: ChartType = 'bar';
  recettesChartType: ChartType = 'line';
  reclamationsChartType: ChartType = 'doughnut';
  userRoleChartType: ChartType = 'pie';

  // --- Chart Data
  colisChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };
  livraisonChartData: any = { labels: [], datasets: [] };
  tourneeChartData: any = { labels: [], datasets: [] };
  tauxReussiteChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  recettesChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  reclamationsChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };
  userRoleChartData: any = { labels: [], datasets: [] };

  // --- Options
  colisChartOptions: any = { responsive: true, maintainAspectRatio: false };
  livraisonChartOptions: any = { responsive: true, maintainAspectRatio: false };
  tourneeChartOptions: any = { responsive: true, maintainAspectRatio: false };
  tauxReussiteChartOptions: any = { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { max: 100, ticks: { callback: (value: any) => value + '%' } } } };
  recettesChartOptions: any = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (value: any) => value + ' DT' } } } };
  reclamationsChartOptions: any = { responsive: true, maintainAspectRatio: false };
  userRoleChartOptions: any = { responsive: true, maintainAspectRatio: false };

  // --- API Data
  globalStats: any;
  recettes: any[] = [];
  tauxReussite!: number;
  delaiMoyen!: number;
  recettesClients: any[] = [];
  recettesClientsParJour: any[] = [];
  colisLivresLivreurs: any[] = [];
  tauxReussiteLivreurs: any[] = [];
  tourneesActives: any[] = [];
  reclamationsStats: any[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadUserRoleChart();
  }

  // --- Load data from API
  loadDashboardData(): void {
    this.dashboardService.getGlobalStats().subscribe((data) => {
      this.globalStats = data;
      this.updateColisChart();
      this.updateTourneeChart();
      this.updateLivraisonChart();
    });

    this.dashboardService.getRecettesParJourParLivreur().subscribe(data => {
      this.recettes = data;
    });

    this.dashboardService.getTauxReussite().subscribe(data => this.tauxReussite = data);
    this.dashboardService.getDelaiMoyen().subscribe(data => this.delaiMoyen = data);

    this.dashboardService.getRecettesTotalesParClient().subscribe(data => {
      this.recettesClients = data;
    });

    this.dashboardService.getRecettesParJourParClient().subscribe(data => {
      this.recettesClientsParJour = data;
      this.updateRecettesChart();
    });

    this.dashboardService.getColisLivresParLivreur().subscribe(d => this.colisLivresLivreurs = d);

    this.dashboardService.getTauxReussiteParLivreur().subscribe(d => {
      this.tauxReussiteLivreurs = d;
      this.updateTauxReussiteChart();
    });

    this.dashboardService.getTourneesActives().subscribe(d => this.tourneesActives = d);

    this.dashboardService.getReclamationsStats().subscribe(d => {
      this.reclamationsStats = d;
      this.updateReclamationsChart();
    });
  }

  loadUserRoleChart() {
    this.dashboardService.getUsersByRole().subscribe((data: any[]) => {
      this.userRoleChartData = {
        labels: data.map(d => d.role),
        datasets: [{ data: data.map(d => d.count), backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545'] }]
      };
    });
  }

  // --- Update Charts
  updateColisChart() {
    if (!this.globalStats) return;
    this.colisChartData = {
      labels: ['En attente', 'Au dépôt', 'En cours', 'Livrés', 'Livrés payés', 'Retours', 'Retours payés', 'Échanges'],
      datasets: [{
        data: [
          this.globalStats.colis_enAttente,
          this.globalStats.colis_auDepot,
          this.globalStats.colis_enCours,
          this.globalStats.colis_livres,
          this.globalStats.colis_livresPayes,
          this.globalStats.colis_retours,
          this.globalStats.colis_retoursPayes,
          this.globalStats.colis_echanges
        ],
        backgroundColor: ['#ffc107', '#6c757d', '#0dcaf0', '#198754', '#20c997', '#dc3545', '#6610f2', '#fd7e14']
      }]
    };
  }

  updateLivraisonChart() {
    if (!this.globalStats) return;
    this.livraisonChartData = {
      labels: ['En attente', 'En cours', 'Terminées'],
      datasets: [{ data: [this.globalStats.livraisons_enAttente, this.globalStats.livraisons_enCours, this.globalStats.livraisons_terminees], backgroundColor: ['#ffc107', '#0dcaf0', '#198754'] }]
    };
  }

  updateTourneeChart() {
    if (!this.globalStats) return;
    this.tourneeChartData = {
      labels: ['En attente', 'En cours', 'Terminées'],
      datasets: [{ data: [this.globalStats.tournees_enAttente, this.globalStats.tournees_enCours, this.globalStats.tournees_terminees], backgroundColor: ['#fd7e14', '#6610f2', '#20c997'] }]
    };
  }

  updateTauxReussiteChart() {
    if (!this.tauxReussiteLivreurs?.length) return;
    this.tauxReussiteChartData = {
      labels: this.tauxReussiteLivreurs.map(r => r[0]),
      datasets: [{ label: 'Taux de réussite (%)', data: this.tauxReussiteLivreurs.map(r => r[1]), backgroundColor: '#0d6efd' }]
    };
  }

  updateRecettesChart() {
    if (!this.recettesClientsParJour?.length) return;
    this.recettesChartData = {
      labels: this.recettesClientsParJour.map(r => r[0]),
      datasets: [{ label: 'Recettes (DT)', data: this.recettesClientsParJour.map(r => r[2]), fill: true, borderColor: '#198754', backgroundColor: 'rgba(25,135,84,0.2)', tension: 0.4 }]
    };
  }

  updateReclamationsChart() {
    if (!this.reclamationsStats?.length) return;
    this.reclamationsChartData = {
      labels: this.reclamationsStats.map(r => r[0]),
      datasets: [{ data: this.reclamationsStats.map(r => r[1]), backgroundColor: ['#ffc107', '#198754', '#dc3545'] }]
    };
  }
}
