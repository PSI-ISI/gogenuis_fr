import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { AuthenticationRoutingModule } from './authentication-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VerificationComponent } from './verification/verification.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    VerificationComponent
  ],
  imports: [
    CommonModule,           // ← Pour *ngIf, *ngFor, etc.
    FormsModule,            // ← Pour ngModel
    ReactiveFormsModule,    // ← Pour formGroup
    RouterModule,           // ← Pour routerLink
    HttpClientModule,
    AuthenticationRoutingModule,
    AngularMaterialModule
  ],
  providers: [
    { provide: 'Window', useValue: window }
  ]
})
export class AuthenticationModule { }