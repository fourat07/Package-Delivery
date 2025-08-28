import { User } from "./colis";

export interface Reclamation {
  id?: number;
  titre: string;
  description: string;
  statut?: 'EN_ATTENTE' | 'TRAITE' | 'REFUSE';
  client?: { idUser: number; username?: string };
  agentAttribue?: { idUser: number; username?: string };
  dateCreation?: string;
  commentaires?: Commentaire[];
}

export interface Commentaire {
  id?: number;
  contenu: string;
  dateCreation?: string;
  auteur?: { idUser: number; username: string; role: string };
}

export enum StatutReclamation {
  EN_ATTENTE = "EN_ATTENTE",
  TRAITE = "TRAITE",
  REFUSE = "REFUSE"
}

