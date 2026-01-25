import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../authentication.service';
import { Login } from './login.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';

@Injectable({ providedIn: 'root' })
export class LoginService {

  constructor(private http: HttpClient, private authService: AuthenticationService) { }

 login(login: Login): Observable<any> {
    const url = `${environment.API_URL}/signIn`;

    // 1. Créer une COPIE de l'objet pour ne pas modifier le champ input de l'utilisateur
    const payload = { ...login };

    // 2. Hasher le mot de passe en MD5
    // .toString() est important pour convertir l'objet WordArray en chaîne hexadécimale
    payload.password = CryptoJS.MD5(login.password).toString();

    // 3. Envoyer l'objet modifié (payload) au lieu de l'objet original (login)
    return this.http.post<any>(url, payload)
      .pipe(
        map((response) => {
          // A. Si votre token est directement dans le map 'result' retourné par le back
          // Adaptez selon votre structure (response.data ou response.result)
          const token = response.data?.token || response.result?.token || response.token; 

          if (token) {
             this.authService.setToken(token); // Assurez-vous que 'this.authService' est accessible ici
             // Si vous êtes DANS AuthService, c'est juste : this.setToken(token);
          }
          
          return response;
        })
      );
  }
}