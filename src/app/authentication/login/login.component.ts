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
      this.redirectBasedOnProfile();
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
      next: (response: any) => {
        console.log('Login successful', response);
        this.isLoading = false;
        
        if (response && response.data) {
          // Stocker le token
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            this.authService.setToken(response.data.token);
          }
          
          // Stocker le profil (type d'utilisateur)
          if (response.data.profile) {
            localStorage.setItem('profile', response.data.profile);
          }
          
          // Stocker l'ID utilisateur
          if (response.data.user_id) {
            localStorage.setItem('user_id', response.data.user_id);
          }
          
          // Stocker le nom complet
          if (response.data.fullname) {
            localStorage.setItem('fullname', response.data.fullname);
          }
          
          // Stocker l'email
          if (response.data.email) {
            localStorage.setItem('user_email', response.data.email);
          }
          
          // Stocker la ville
          if (response.data.city) {
            localStorage.setItem('user_city', response.data.city);
          }
          
          // Stocker le téléphone
          if (response.data.phone) {
            localStorage.setItem('user_phone', response.data.phone);
          }
          
          // Stocker le login/username
          localStorage.setItem('username', response.data.login || credentials.login);
          
          // Rediriger selon le profil
          if (response.data.profile === "dG91cmlzdA==") { // tourist
            this.router.navigate(['/dashboard']);
          } else if (response.data.profile === "Y29tcGFueQ==") { // company
            this.router.navigate(['/dashboard-etablissement']);
          } else {
            this.router.navigate(['/dashboard-collaborateur']);
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.loginFailed = true;
        console.error('Login failed', error);
      }
    });
  }
  
  private redirectBasedOnProfile(): void {
    const profile = localStorage.getItem('profile');
    
    if (profile === 'dG91cmlzdA==') {
      this.router.navigate(['/dashboard']);
    } else if (profile === 'Y29tcGFueQ==') {
      this.router.navigate(['/dashboard-etablissement']);
    } else {
      this.router.navigate(['/dashboard-collaborateur']);
    }
  }
}