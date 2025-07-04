import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ApiService, Category, Group, User } from '../../Service/api.service';
import { AddExpenseDialogComponent } from "./add-expense-dialog/add-expense-dialog.component";

export interface Expense {
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
  imports: [CommonModule, CardModule, ButtonModule, AddExpenseDialogComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
  providers:[DatePipe]
})
export class ExpensesComponent implements OnInit {
  newExpense!:FormGroup;
  showDialog = false;
  expenses!:any;
  categories!:Category[];
  groups!: Group[];
  users!: User[];
  groupMembers!: User[];
  
  constructor(private apiService: ApiService){}

  ngOnInit(): void {
    this.apiService.getAllExpenses().subscribe({
    next: (data) => {
      this.expenses = data.slice().reverse();
    },
    error: (err) => {
      console.error('Failed to load expenses:', err);
    }
  });
  this.apiService.getCategories().subscribe({
    next: (data) => {
      this.categories = data;
    },
    error: (err) => {
      console.error('Failed to load expenses:', err);
    }
  });
  this.apiService.getAllGroups().subscribe({
    next: (data) => {
      this.groups = data;
      
      if (this.groups.length > 0) {
        this.groupMembers = this.groups[0].members;
      }
    }
    , error: (err) => {
      console.error('Failed to load groups:', err);
    }
  });
  this.apiService.getAllUsers().subscribe({
    next: (data) => { 
      this.users = data;
    },
    error: (err) => {
      console.error('Failed to load users:', err);
    }
  });
    
  }
  
  openDialog(){
    this.showDialog = true;
  }
  submitExpense(){
    
    // this.apiService.addExpense(newExpense).subscribe({
    //   next: (savedExpense) => {
    //     this.expenses = [...this.expenses, savedExpense];
    //     this.showDialog = false;
    //     this.newExpense.reset();
    //   },
    //   error: err => {
    //     console.error('Failed to add expense:', err);
    //   }
    // });
  }
  
}
