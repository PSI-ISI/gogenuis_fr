import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './register.component';
import { Router } from '@angular/router';
import { RegisterService } from './register.service';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';
import { MobileService } from '../../core/mobile.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let registerService: RegisterService;

  beforeEach(async () => {

    const registerServiceStub: any = { register: () => { } };
    const routerStub: any = { navigate: (url: Array<string>) => { } };
    const mobileServiceStub: any = { isMobile: () => false, mobileChanged$: of(false) };

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        BrowserAnimationsModule,
        AngularMaterialModule
      ],
      declarations: [RegisterComponent],
      providers: [
        { provide: RegisterService, useValue: registerServiceStub },
        { provide: Router, useValue: routerStub },
        { provide: MobileService, useValue: mobileServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(RegisterComponent, { set: { template: '' } });
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    registerService = TestBed.inject(RegisterService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when calling register()', () => {
    it('should return if the form is invalid', () => {
      vi.spyOn(registerService, 'register');
      component.register();
      expect(registerService.register).not.toHaveBeenCalled();
    });

    it('should call the register service if the form is valid', () => {
      vi.spyOn(registerService, 'register').mockReturnValue(new Observable(observer => observer.next({})));
      component.registerForm.controls['firstName'].setValue('test');
      component.registerForm.controls['lastName'].setValue('test');
      component.registerForm.controls['email'].setValue('test@test.com');
      component.registerForm.controls['username'].setValue('user');
      component.registerForm.controls['password'].setValue('pass');
      component.registerForm.controls['confirmPassword'].setValue('pass');
      component.registerForm.controls['phones'].setValue([{ phoneNumber: '1231231234', phoneType: 'mobile' }]);
      component.register();
      expect(registerService.register).toHaveBeenCalled();
    });
  });

  describe('when calling the phoneNumbers() getter', () => {
    it('should retrieve the phone numbers out of the form', () => {
      component.registerForm.controls['phones'].setValue([{ phoneNumber: '1231231234', phoneType: 'mobile' }]);
      const phoneNumbers = component.phones;
      expect(phoneNumbers.length).toBe(1);
    });
  });
});