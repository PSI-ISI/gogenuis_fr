/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { LoginComponent } from './login.component';
import { LoginService } from './login.service';
import { AuthenticationService } from '../authentication.service';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';
import { MobileService } from '../../core/mobile.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loginService: LoginService;

  beforeEach(async () => {

    const loginServiceStub: any = { login: () => { } };
    const windowStub: any = { location: { reload: () => { } } };
    const mobileServiceStub: any = { isMobile: () => false, mobileChanged$: of(false) };

    TestBed.configureTestingModule({
      imports: [
        AngularMaterialModule,
        ReactiveFormsModule
      ],
      declarations: [LoginComponent],
      providers: [
        { provide: LoginService, useValue: loginServiceStub },
        { provide: AuthenticationService, useValue: { isAuthenticated: () => false, setToken: vi.fn() } },
        { provide: 'Window', useValue: windowStub },
        { provide: MobileService, useValue: mobileServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loginService = TestBed.inject(LoginService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when calling login()', () => {

    it('should return if the form is invalid', () => {
      vi.spyOn(loginService, 'login');
      component.login();
      expect(loginService.login).not.toHaveBeenCalled();
    });

    it('should call the login service if the form is valid', () => {
      component.loginForm.controls['username'].setValue('username');
      component.loginForm.controls['password'].setValue('password');
      vi.spyOn(loginService, 'login').mockReturnValue(of({}));
      component.login();
      expect(loginService.login).toHaveBeenCalled();
    });
  });

});