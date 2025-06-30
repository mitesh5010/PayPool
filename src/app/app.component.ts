import { Component, OnInit } from '@angular/core';
import { LoginComponent } from "./auth/login/login.component";
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  user: {
    id: number;
    email: string;
    password: string;
    name: string;
  };
  iat: number;
  exp: number;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'PayPool';
  constructor(private auth: AuthService){}

  ngOnInit(): void {
    const token = this.auth.getToken();
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const user = decoded.user;
        this.auth.userSignal.set(user);
      } catch (error) {
        console.error('Invalid token:', error);
        this.auth.logout(); // optional fallback
      }
    }
  }

  get isLogin() {
    return !!this.auth.getToken();
  }
  logout() {
    this.auth.logout();
  }

}
