import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import { AuthenticationService } from '../authentication.service';
import { Login } from './login.model';

@Component({
  selector: 'app-login',
  standalone: false, // Si vous utilisez des modules
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // loginForm!: FormGroup;
  // loginFailed = false;
  // isMobile = false;

  // constructor(
  //   private formBuilder: FormBuilder,
  //   private loginService: LoginService,
  //   private authService: AuthenticationService,
  //   private router: Router
  // ) {}

  // ngOnInit() {
  //   this.loginForm = this.formBuilder.group({
  //     username: ['', Validators.required],
  //     password: ['', Validators.required]
  //   });
  // }

  // login() {
  //   if (this.loginForm.valid) {
  //     const credentials: Login = this.loginForm.value;
  //     this.loginService.login(credentials).subscribe({
  //       next: (response) => {
  //         this.authService.setToken(response.token);
  //         this.router.navigate(['/dashboard']);
  //       },
  //       error: (error) => {
  //         this.loginFailed = true;
  //         console.error('Login failed', error);
  //       }
  //     });
  //   }
  // }

  loginForm: FormGroup;
  loginFailed = false;
  isMobile = false;
  
  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    
    this.checkScreenSize();
  }
  
  ngOnInit(): void {
    this.checkScreenSize();
  }
  
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768; // Bootstrap md breakpoint
  }
  
  login() {
    if (this.loginForm.valid) {
      // Votre logique de connexion
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
  
  ngOnDestroy() {
    // Nettoyage si nécessaire
  }
}