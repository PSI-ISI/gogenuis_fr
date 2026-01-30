import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-login',
  standalone: false,  // ← IMPORTANT: Explicitement false pour NgModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  loginFailed = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialiser le formulaire
    this.loginForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    });
    
    // Si déjà connecté, rediriger vers dashboard
    if (localStorage.getItem('token')) {
      this.router.navigate(['/dashboard']);
    }
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginFailed = false;

    const credentials = this.loginForm.value;

    this.loginService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.isLoading = false;
        
        // Stocker le token
        if (response && response.data.token) {
          localStorage.setItem('token', response.data.token);
          this.authService.setToken(response.data.token);
        }
        
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.loginFailed = true;
        console.error('Login failed', error);
      }
    });
  }
}