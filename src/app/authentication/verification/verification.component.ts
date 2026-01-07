import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VerificationService } from './verification.service';

@Component({
  selector: 'app-verification',
  standalone: false,
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit {
  verificationForm!: FormGroup;
  codeSent = false;
  verificationFailed = false;

  constructor(
    private formBuilder: FormBuilder,
    private verificationService: VerificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.verificationForm = this.formBuilder.group({
      code: ['', Validators.required]
    });
  }

  verify() {
    if (this.verificationForm.valid) {
      const code = this.verificationForm.value.code;
      this.verificationService.verify(code).subscribe({
        next: (response) => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.verificationFailed = true;
          console.error('Verification failed', error);
        }
      });
    }
  }

  resendCode() {
    this.verificationService.sendCode().subscribe({
      next: () => {
        this.codeSent = true;
      },
      error: (error) => {
        console.error('Failed to resend code', error);
      }
    });
  }

  // Alias to match template's click handler
  sendCode() {
    this.resendCode();
  }
}