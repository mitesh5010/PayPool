import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { FormGroup } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
  paidBy: string;
  group: string;
  type: 'paid' | 'owe';
}

@Component({
  selector: 'app-expenses',
  imports: [CommonModule,CardModule, ButtonModule, InputTextModule, CalendarModule, DialogModule, MultiSelectModule, InputTextModule,InputNumberModule, SelectModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css'
})
export class ExpensesComponent {
  newExpense!:FormGroup;
  showDialog = false;
  
  openDialog(){
    this.showDialog = true;
  }
  groupMembers = [
    {name: 'you', id:1},
    {name: 'gs', id:2},
    {name: 'kjn', id:3},
  ]
  groups = [
    {name: 'Weekend trip', id:1},
    {name: 'bills', id:2},
    {name: 'sunday', id:3},
  ]
  categories=[
    {name:'Food', id:1},
    {name:'Entertainment', id:2},
    {name:'Travel', id:3},
    {name:'Other', id:4},
  ]
expenses:Expense[] = 
[
    { id: 1, description: 'Dinner at Restaurant', amount: 125, date: '2025-06-30', category: 'Food', paidBy: 'You', group: 'Weekend Trip', type: 'paid' },
    { id: 2, description: 'Uber Ride', amount: 45, date: '2025-06-29', category: 'Transport', paidBy: 'John', group: 'Weekend Trip', type: 'owe' },
    { id: 3, description: 'Grocery Shopping', amount: 89, date: '2025-06-28', category: 'Food', paidBy: 'Sarah', group: 'Roommate Bills', type: 'owe' },
    { id: 4, description: 'Movie Tickets', amount: 36, date: '2025-06-27', category: 'Entertainment', paidBy: 'You', group: 'Weekend Trip', type: 'paid' },
  ];
  submitGroup(){}
}
