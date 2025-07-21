import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
  iat: number;
  // Add other claims from your JWT as needed
}

interface CurrentUser {
  username: string;
  role: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  getNotificationCount() {
    throw new Error('Method not implemented.');
  }
  private baseUrl = 'http://localhost:8081/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Initialize user from token if exists
    const token = this.getToken();
    if (token) {
      this.setCurrentUserFromToken(token);
    }
  }

  // LOGIN
  login(credentials: { username: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<{ token: string }>(
      `${this.baseUrl}/login`,
      credentials,
      { headers }
    ).pipe(
      tap(response => {
        this.storeToken(response.token);
        this.setCurrentUserFromToken(response.token);
      }),
      catchError(this.handleError)
    );
  }

  // REGISTER
  register(userData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(
      `${this.baseUrl}/register`,
      userData,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // STORE TOKEN
  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // GET TOKEN
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // REMOVE TOKEN (LOGOUT)
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/user/login']);
  }

  // CHECK IF LOGGED IN
  isLoggedIn(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  // GET CURRENT USER (IMPLEMENTED)
  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  // DECODE TOKEN AND SET CURRENT USER
  private setCurrentUserFromToken(token: string): void {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      
      const currentUser: CurrentUser = {
        username: decoded.sub,
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
    return this.currentUserSubject.value?.role || null;
  }

  // ROLE HELPERS
  isAdmin(): boolean {
    return this.getUserRole() === 'ROLE_ADMIN';
  }

  isLivreur(): boolean {
    return this.getUserRole() === 'ROLE_LIVREUR';
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


}