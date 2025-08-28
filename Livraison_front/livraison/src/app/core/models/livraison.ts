import { Colis, User } from "./colis";

export interface Livraison {
    id : number,
    colisCount : number
    reference: string;
    dateCreation: Date;
  codeBarre: string;
  user?: User
  qrCodeBase64?: string;
    colisList : Colis[]
    status: string;


}