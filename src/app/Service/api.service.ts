import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface User {
  readonly id: number;
  readonly name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private readonly apiUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<readonly User[]>{
    return this.http.get<readonly User[]>(`${this.apiUrl}/users`);
  }
}
