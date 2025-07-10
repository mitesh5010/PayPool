import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from './Service/data.model';

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
    this.auth.initializeUserFromToken();
  }

}
