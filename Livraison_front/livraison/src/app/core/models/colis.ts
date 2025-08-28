export enum StatutColis {
  EN_ATTENTE = 'EN_ATTENTE',
  AU_DEPOT = 'AU_DEPOT',
  EN_COURS = 'EN_COURS',
  LIVRE = 'LIVRE',
  LIVRE_PAYE = 'LIVRE_PAYE',
  RETOUR = 'RETOUR',
  RETOUR_PAYE = 'RETOUR_PAYE',
  ECHANGE = 'ECHANGE'
}

export enum Paiement {
  CHEQUE = 'CHEQUE',
  ESPECE = 'ESPECE',
  VIREMENT = 'VIREMENT'
}

export interface User {
  idUser: number;
  username: string;
  email?: string;
  frais_retour?: number;
  disponible?: boolean; // Optional, if you have this field
  adresse?: string; // Optional, if you have this field
  // autres champs si besoin
}

export interface HistoriqueColis {
  id?: number;
  colisId: number;
  statut_colis: StatutColis;
  date: Date;
  commentaire?: string;
  utilisateur: User;
}

export interface Colis {
  id?: number;
  adresse: string;
  telephone: string;
  prix: number;
  paiement: Paiement;
  nbArticle: number;
  remarque?: string;
  codeBarre: string;
  statut_colis: StatutColis;
  user: User;
  frais_retour?: number;
  historique: HistoriqueItem[];   // ✅ maintenant inclus
  historiqueStatuts?: HistoriqueColis[]
}
export interface HistoriqueItem {
  ancienStatut: string;
  nouveauStatut: string;
  dateChangement: string;
  changedBy?: string;
  commentaire?: string;
  colisId?: number;
}
