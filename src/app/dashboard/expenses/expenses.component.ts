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
import { ApiService, Category } from '../../Service/api.service';

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
  imports: [CommonModule,CardModule, ButtonModule, InputTextModule, CalendarModule, DialogModule, MultiSelectModule, InputTextModule,InputNumberModule, SelectModule,DatePickerModule, ReactiveFormsModule ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
  providers:[DatePipe]
})
export class ExpensesComponent implements OnInit {
  newExpense!:FormGroup;
  showDialog = false;
  expenses!:any;
  categories!:Category[];
  
  constructor(private apiService: ApiService, private fb: FormBuilder,private datePipe: DatePipe){}

  ngOnInit(): void {
    this.apiService.getAllExpenses().subscribe({
    next: (data) => {
      this.expenses = data;
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
    this.newExpense = this.fb.group({
      description: ['', Validators.required],
      date: ['', Validators.required],
      amount: [null, Validators.required],
      selectedGroup: ['', Validators.required],
      paidBy: ['', Validators.required],
      selectedCategory: ['', Validators.required]
    });
  }
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
  submitExpense(){
    if (this.newExpense.valid) {
      const formValue = this.newExpense.value;

      const formattedDate = this.datePipe.transform(formValue.date, 'MMM d y');

      const newExpense: Expense = {
      description: formValue.description,
      amount: formValue.amount,
      date: formattedDate|| '',
      category: this.categories.find(c => c.id === formValue.selectedCategory)?.category || '',
      paidBy: this.groupMembers.find(m => m.id === formValue.paidBy)?.name || '',
      group: this.groups.find(g => g.id === formValue.selectedGroup)?.name || '',
      type: formValue.paidBy === 1 ? 'paid' : 'owe',
    };
    this.apiService.addExpense(newExpense).subscribe({
      next: (savedExpense) => {
        this.expenses = [...this.expenses, savedExpense];
        this.showDialog = false;
        this.newExpense.reset();
      },
      error: err => {
        console.error('Failed to add expense:', err);
      }
    });
  }
  }
}
