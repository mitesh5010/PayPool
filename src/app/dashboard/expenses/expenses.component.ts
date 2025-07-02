import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';

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
  imports: [CommonModule,CardModule, ButtonModule, InputTextModule, CalendarModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css'
})
export class ExpensesComponent {
expenses:Expense[] = 
[
    { id: 1, description: 'Dinner at Restaurant', amount: 125, date: '2025-06-30', category: 'Food', paidBy: 'You', group: 'Weekend Trip', type: 'paid' },
    { id: 2, description: 'Uber Ride', amount: 45, date: '2025-06-29', category: 'Transport', paidBy: 'John', group: 'Weekend Trip', type: 'owe' },
    { id: 3, description: 'Grocery Shopping', amount: 89, date: '2025-06-28', category: 'Food', paidBy: 'Sarah', group: 'Roommate Bills', type: 'owe' },
    { id: 4, description: 'Movie Tickets', amount: 36, date: '2025-06-27', category: 'Entertainment', paidBy: 'You', group: 'Weekend Trip', type: 'paid' },
  ];
}
