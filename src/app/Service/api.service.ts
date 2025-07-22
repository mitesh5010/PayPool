import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Category, Expense, Group, Settlement, User } from './data.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private readonly apiUrl = 'https://json-server-auth-27lj.onrender.com';
  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]>{
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getCategories(){
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getAllExpenses() {
  return this.http.get<Expense[]>(`${this.apiUrl}/expenses`);
}
getUserExpenses(userId: number): Observable<Expense[]> {
  return this.http.get<Expense[]>(`${this.apiUrl}/expenses?paidBy=${userId}`);
}

  addExpense(expense: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/expenses`, expense);
  }

  getAllGroups(): Observable<Group[]>{
    return this.http.get<Group[]>(`${this.apiUrl}/groups`);
  }

  addGroup(group:Group):Observable<Group>{
    return this.http.post<Group>(`${this.apiUrl}/groups`, group);
  }
  getGroupMembers(groupId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/groups/${groupId}/members`);
  }
  filterUserGroups(allGroups: Group[], userId: number): Group[] {
    return allGroups.filter(group =>
      group.userId === userId || group.members.some(member => member.id === userId)
    );
  }
  // Get active groups for a user
getActiveGroups(userId: number): Observable<Group[]> {
  return this.getAllGroups().pipe(
    map(groups => groups.filter(group => 
      group.status === 'ACTIVE' && 
      (group.userId === userId || group.members.some(member => member.id === userId))
    )
  ));
}
  getAllSettlements(): Observable<Settlement[]>{
    return this.http.get<Settlement[]>(`${this.apiUrl}/settlements`);
  }
  postSettlements(settlement: Settlement): Observable<Settlement> {
    return this.http.post<Settlement>(`${this.apiUrl}/settlements`, settlement);
  }
}
