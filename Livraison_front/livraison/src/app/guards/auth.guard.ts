import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserService } from '../features/user/services/user/user.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

      

    const expectedRole = route.data['expectedRole']; // role from route config
    const token = this.userService.getToken();
    const userRole = this.userService.getUserRole();

    if (!token || !userRole || (expectedRole && expectedRole !== userRole)) {
      this.router.navigate(['/user/login']);
      return false;
    }

    return true;
  }

}
