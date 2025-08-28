import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { AUTH_TOKEN_KEY } from 'src/app/core/models/token.constants';

interface DecodedToken {
  idUser: string;
   email?: string;       // Make optional if not always present
  adresse?: string;     // Make optional if not always present
  phoneNumber?: string;
  frais_retour?:number;
  photo: string;  
    disponible?: boolean; // Optional, if you have this field
      nbReclamationsAssignees: number; // ✅ ajouté

     // Make optional if not always present
  sub: string;
  role: string;
  exp: number;
  iat: number;
  // Add other claims from your JWT as needed
}

interface CurrentUser {
  idUser: string;
  username: string;
   email?: string;       // Make optional if not always present
  adresse?: string;     // Make optional if not always present
  phoneNumber?: string;
  frais_retour?:number; // Make optional if not always present
  photo?: string;
       // Make optional if not always present
  role: string;
  disponible?: boolean; // Optional, if you have this field
  token: string;
}
  
@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:8081/auth';
    private base = 'http://localhost:8081/user';

   //private readonly TOKEN = 'token';
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  selectedFile!: File ;


/*     private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('auth_token'));

  token$ = this.tokenSubject.asObservable();
 */
  constructor(private http: HttpClient, private router: Router) {
    // Initialize user from token if exists
    const token = this.getToken();
    if (token) {
      this.setCurrentUserFromToken(token);
    }
  }
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

/*     

  getToken(): string | null {
    // 🔄 si pas en mémoire, on recharge depuis LocalStorage
    return this.token || localStorage.getItem('auth_token');
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  } */


  // LOGIN
login(credentials: { username: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<{ token: string, type: string, role: string, idUser: number }>("http://localhost:8081/auth/login",credentials,{ headers }
    ).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem(AUTH_TOKEN_KEY, response.token);

            const decoded = this.parseJwt(response.token);
        const user = {
          idUser: decoded.idUser,
          username: decoded.sub,
          role: decoded.role,
          photo: decoded.photo || null,
          email: decoded.email || null,
          adresse : decoded.adresse || null,
          phoneNumber : decoded.phoneNumber || null,
          frais_retour : decoded.frais_retour || null,
          disponible : decoded.disponible || null,
          token: response.token
        };

          this.setCurrentUser(user);
          
        //this.setCurrentUserFromToken(response.token);
          //console.log('Token stored:', response.token);
         // console.log("✅ Token saved:", response.token);
        } else {
          console.error('No token in login response:', response);
        }
      }),
      catchError(this.handleError)
    );
  }

  setCurrentUser(user: any) {
  localStorage.setItem('user', JSON.stringify(user));
  this.currentUserSubject.next(user); // si tu utilises BehaviorSubject
}

  
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  // REGISTER
  register(userData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(  
      "http://localhost:8081/user/register",
      userData,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }


  updateUser(idUser: number, userData: any): Observable<any> {
    return this.http.put(`${this.base}/updateuser/${idUser}`, userData)
  }
getAllUsers(): Observable<any[]> {
     return this.http.get<any[]>(`${this.base}/getAllUsers`); 
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.base}/deleteuser/${userId}`)
  }


  getUserDetails(userId: number): Observable<any> {
    const token = localStorage.getItem('jwtToken'); // or sessionStorage.getItem(...)
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
    return this.http.get(`${this.base}/userdetails/${userId}`, { headers });
  }
/* setCurrentUserFromToken(token: string): void {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Decoded token payload:', payload);

    const user = {
      userId: payload.userId || payload.id || payload.subId, // ⚠️ adapte selon ton backend
      username: payload.sub, // ou payload.username
      role: payload.role,
      token: token
    };

    localStorage.setItem('user', JSON.stringify(user));
  } catch (e) {
    console.error('Failed to decode token:', e);
  }
} */

  // STORE TOKEN
/*   private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  } */

  // GET TOKEN
     getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } 

  // REMOVE TOKEN (LOGOUT)
  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    //localStorage.removeItem('token'); // Clear token from localStorage
    this.router.navigate(['/user/login']);
  }

/*   clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('user'); // Clear user data as well
    this.currentUserSubject.next(null);
    this.router.navigate(['/user/login']);
  } */

  // CHECK IF LOGGED IN
  isLoggedIn(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

/*   // GET CURRENT USER (IMPLEMENTED)
  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }
 */

getCurrentUser(): any {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

  // DECODE TOKEN AND SET CURRENT USER
  private setCurrentUserFromToken(token: string): void {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      //console.log('Decoded token:', decoded);
      const currentUser: CurrentUser = {
        idUser: decoded.idUser  , // Assuming sub is the user ID
        username: decoded.sub,
        email: decoded.email || '', // Optional, handle if not present
        adresse: decoded.adresse || '', // Optional, handle if not present
        phoneNumber: decoded.phoneNumber || '', // Optional, handle if not present
        frais_retour: decoded.frais_retour || 0, // Optional, handle if not present
        disponible: decoded.disponible || false, // Optional, handle if not present
        photo: decoded.photo || '', // Optional, handle if not present
        role: decoded.role,
        token: token
      };
      this.currentUserSubject.next(currentUser);
    } catch (error) {
      console.error('Error decoding token:', error);
      this.logout();
    }
  }

  // CHECK TOKEN EXPIRATION
  private isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  // GET USER ROLE
getUserRole(): string | null {
  const user = this.getCurrentUser(); // récupère l'objet utilisateur complet
  return user?.role || null;          // retourne le rôle si défini, sinon null
}




  // ERROR HANDLER
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.status === 401) errorMessage = 'Invalid credentials';
      else if (error.status === 400) errorMessage = error.error.message || 'Bad request';
    }
    return throwError(() => new Error(errorMessage));
  }





  fetchUserProfile() {
    return this.http.get<any>('auth/profile').subscribe({
      next: (user) => {
        // Map the response to CurrentUser type
        const token = this.getToken() || '';
        const currentUser: CurrentUser = {
          idUser: user.idUser,
          username: user.username,
          role: user.role,
          token: token
        };
        this.currentUserSubject.next(currentUser);
      },
      error: (err) => console.error('Failed to fetch profile', err)
    });
  }

  updateProfile(userData: any) {
    return this.http.put('auth/profile', userData);
  }



changePassword(passwordData: { username: string, oldPassword: string, newPassword: string }) {
  const token = this.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  return this.http.post(`${this.baseUrl}/change-password`, passwordData, { headers });
}

   getUsername(): string {
  const token = localStorage.getItem(AUTH_TOKEN_KEY) ;
  if (!token) throw new Error('No JWT token found');
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.username || '';
  } catch (e) {
    throw new Error('Invalid token format');
  }
} 

uploadPhoto(selectedFile: File): Observable<{ photoUrl: string }> {
  const formData = new FormData();
  formData.append('file', selectedFile);

  return this.http.post<{ photoUrl: string }>(
    "http://localhost:8081/user/upload-photo", 
    formData
  );
}
  OnFileSelected($event: any) {
    this.selectedFile = $event.target.files[0];
    console.log("Fichier sélectionné :", this.selectedFile);
  
  }

  getAgents(): Observable<any[]> {
    return this.http.get<DecodedToken[]>(`${this.base}/agents/disponibles`);
  }

}