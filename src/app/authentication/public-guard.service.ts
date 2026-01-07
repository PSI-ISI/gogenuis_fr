import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class PublicGuardService implements CanActivate {
  constructor(private authService: AuthenticationService, private router: Router) {}

  canActivate(): boolean {
    const isAuthed = this.authService.isAuthenticated();
    if (isAuthed) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
