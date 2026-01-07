import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthenticationRoutingModule } from "./authentication/authentication-routing.module";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AuthenticationRoutingModule],
  templateUrl: './app.html'
})
export class AppComponent {}