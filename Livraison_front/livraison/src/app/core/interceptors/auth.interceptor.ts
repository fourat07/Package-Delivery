import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH_TOKEN_KEY } from '../models/token.constants';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    //console.log("🔍 Interceptor checking token:", token);

    if (token ) {
      console.log('✅ Adding Authorization header with token', token);
      const cloned = req.clone({
        setHeaders: { 
          Authorization:`Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }

    //console.log('⚠️ No token found, proceeding without Authorization header');
    return next.handle(req);
  }
}
