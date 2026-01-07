import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Observable, of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { VerificationComponent } from './verification.component';
import { VerificationService } from './verification.service';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('VerificationComponent', () => {
  let component: VerificationComponent;
  let fixture: ComponentFixture<VerificationComponent>;
  let verificationService: VerificationService;

  beforeEach(async () => {

    const verificationServiceStub: any = {
      sendCode: () => { },
      verify: () => { }
    };

    const windowStub: any = { location: { reload: () => { } } };

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        AngularMaterialModule,
        RouterTestingModule
      ],
      declarations: [VerificationComponent],
      providers: [
        { provide: VerificationService, useValue: verificationServiceStub },
        { provide: 'Window', useValue: windowStub },
        provideAnimationsAsync()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    verificationService = TestBed.inject(VerificationService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when calling sendCode()', () => {
    it('should call the verification service to send the code', () => {
      vi.spyOn(verificationService, 'sendCode').mockReturnValue(of({}));
      component.resendCode();
      expect(verificationService.sendCode).toHaveBeenCalled();
      expect(component.codeSent).toBe(true);
    });
  });

  describe('when calling verify()', () => {
    it('should return if the form is invalid', () => {
      vi.spyOn(verificationService, 'verify');
      component.verify();
      expect(verificationService.verify).not.toHaveBeenCalled();
    });

    it('should set verificationFailed to true if service returns error', () => {
      vi.spyOn(verificationService, 'verify').mockReturnValue(throwError(() => new Error('fail')));
      component.verificationForm.get('code')!.setValue('123456');
      component.verify();
      expect(verificationService.verify).toHaveBeenCalled();
      expect(component.verificationFailed).toBe(true);
    });

    it('should call the verify service successfully if form is valid', () => {
      vi.spyOn(verificationService, 'verify').mockReturnValue(of({}));
      component.verificationForm.get('code')!.setValue('123456');
      component.verify();
      expect(verificationService.verify).toHaveBeenCalled();
      expect(component.verificationFailed).toBe(false);
    });
  });
});