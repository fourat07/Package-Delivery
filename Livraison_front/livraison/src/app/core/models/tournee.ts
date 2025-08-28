import { Livraison } from "./livraison";

export interface Tournee {
  id: number;
  date: string;
  status: string;
  adressePickup : string;
  datePickup: string;
  livreur: { id: number; username: string ; adresse?: string};
  livraisons: Livraison[];
  livraisonsCount: number;
}