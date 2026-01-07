import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
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
    CommonModule,
    ReactiveFormsModule,
    AuthenticationRoutingModule,
    AngularMaterialModule
  ],
  providers: [
    provideHttpClient()
  ]
})
export class AuthenticationModule { }