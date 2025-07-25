import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs';
import { DecodedToken, User } from '../Service/data.model';
import { jwtDecode } from 'jwt-decode';
import { LoadingService } from '../Service/loading.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = `${environment.apiUrl}`;

  userSignal = signal<User | null>(null)

  constructor(private http: HttpClient, private router: Router, private loading: LoadingService) { }

  initializeUserFromToken() {
  const token = this.getToken();
  if (token) {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const user: User = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name
      };
      this.userSignal.set(user);
    } catch (error) {
      console.error('Failed to decode token', error);
      this.logout();
    }
  }
}

  login(email:string, password:string){
    this.loading.show();
    return this.http.post(`${this.api}/login`, { email, password }).pipe(
      tap( (res : any) =>{
        localStorage.setItem('token',res.token);
        this.userSignal.set(res.user);
        this.loading.hide();
      }),
      catchError(err => {
      this.loading.hide(); 
      throw err;
    })
    );  
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
  getUserId(): number {
    const user = this.userSignal();
    return user ? user.id : 0;
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  verifyPin(userId: number, pin: string){
    return this.http.get<any>(`${this.api}/users/${userId}`).pipe(
      map(user => {
        return user && user.pin === pin;
      })
    );
  }
}
