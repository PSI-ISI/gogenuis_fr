import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from './authentication.service';

@Injectable()
export class SecurityHttpInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.authenticationService.isAuthenticated()) {
      const accessToken = this.authenticationService.getToken();
      request = request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } });
    }

    return next.handle(request)
      .pipe(
        catchError(errorResponse => {
          if (errorResponse.status !== 401) {
            return throwError(() => errorResponse);
          }

          const errors = errorResponse.error;
          if (errors && Array.isArray(errors)) {
            const error = errors[0];
            if (error?.error === '401_verify_user') {
              this.authenticationService.goToVerification();
              return throwError(() => errorResponse);
            }
          }

          this.authenticationService.logout();
          return throwError(() => errorResponse);
        })
      );
  }
}