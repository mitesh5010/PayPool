import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Expense } from '../dashboard/expenses/expenses.component';

export interface User {
  readonly id: number;
  readonly name: string;
}
export interface Category{
  category:string;
  id:number;
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

  getCategories(){
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getAllExpenses() {
  return this.http.get<Expense[]>(`${this.apiUrl}/expenses`);
}

  addExpense(expense: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/expenses`, expense);
}
}
