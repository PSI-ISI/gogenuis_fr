import { TestBed, inject } from '@angular/core/testing';
import { vi } from 'vitest';
import { Router } from '@angular/router';
import { AuthGuardService } from './auth-guard.service';
import { AuthenticationService } from './authentication.service';

describe('AuthGuardService', () => {
  beforeEach(() => {

    const authenticationServiceStub: any = { isAuthenticated: () => { } };
    const routerStub: any = { navigate: (url: Array<string>) => { } };

    TestBed.configureTestingModule({
      providers: [
        AuthGuardService,
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: Router, useValue: routerStub }
      ]
    });
  });

  it('should exist', inject([AuthGuardService], (service: AuthGuardService) => {
    expect(service).toBeTruthy();
  }));

  describe('when canActivate() is called', () => {
    it('should redirect to login and return false if token is invalid',
      inject([AuthGuardService, Router, AuthenticationService],
        (service: AuthGuardService, router: Router, authService: AuthenticationService) => {
          vi.spyOn(router, 'navigate');
          vi.spyOn(authService, 'isAuthenticated').mockImplementation(() => false);
          const canActivate = service.canActivate();
          expect(canActivate).toBe(false);
          expect(router.navigate).toHaveBeenCalledWith(['authentication/login']);
    }));

    it('should return true if token is valid',
      inject([AuthGuardService, Router, AuthenticationService],
        (service: AuthGuardService, router: Router, authService: AuthenticationService) => {
          vi.spyOn(router, 'navigate');
          vi.spyOn(authService, 'isAuthenticated').mockImplementation(() => true);
          const canActivate = service.canActivate();
          expect(canActivate).toBe(true);
          expect(router.navigate).not.toHaveBeenCalled();
    }));
  });
});