import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

interface User  {
  name: string
  email: string,
  password: string,
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = 'http://localhost:3000';

  userSignal = signal<User | null>(null)

  constructor(private http: HttpClient, private router: Router) { }

  login(email:string, password:string){
    return this.http.post(`${this.api}/login`, { email, password }).pipe(
      tap( (res : any) =>{
        localStorage.setItem('token',res.accessToken);
        this.userSignal.set(res.user)
      })
    )
  }
  register(user: User){
    return this.http.post(`${this.api}/register`, user);
  }
  logout() {
    localStorage.removeItem('token');
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}
