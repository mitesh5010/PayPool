import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {  FormGroup } from '@angular/forms';
import { ApiService} from '../../Service/api.service';
import { AddExpenseDialogComponent } from "./add-expense-dialog/add-expense-dialog.component";
import { Category, Expense, Group, User } from '../../Service/data.model';
import { AuthService } from '../../auth/auth.service';
import { LoadingService } from '../../Service/loading.service';
import { forkJoin } from 'rxjs';
import { PrimeNGModules } from '../../shared/primeng-imports/primeng-imports.module';

interface NameUser extends User {
  name: string
}

@Component({
  selector: 'app-expenses',
  imports: [CommonModule, PrimeNGModules,AddExpenseDialogComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
  providers:[DatePipe]
})
export class ExpensesComponent implements OnInit {
  newExpense!:FormGroup;
  showDialog = false;
  expenses:Expense[]=[];
  categories!:Category[];
  groups!: Group[];
  users!:NameUser[];
  groupMembers!: User[];
  userId!:number;
  
  constructor(private apiService: ApiService, private auth: AuthService, private loading: LoadingService){}

  ngOnInit(): void {
    this.loading.show();
    this.userId = this.auth.getUserId();
    this.loadData();
    
  }
  loadData(){
    this.loading.show();
    forkJoin({
      expenses: this.apiService.getAllExpenses(),
      categories: this.apiService.getCategories(),
      groups: this.apiService.getAllGroups(),
      users: this.apiService.getAllUsers()
    }).subscribe({
      next: ({ expenses, categories, groups, users }) => {
        this.expenses = expenses.filter(exp =>
          exp.splitDetails.some(split => split.id === this.userId)
        ).reverse();
        this.categories = categories;
        this.groups = groups;
        if (this.groups.length > 0) {
          this.groupMembers = this.groups[0].members;
        }
        this.users = users;
        this.loading.hide();
      },
      error: (err) => {
        console.error('Failed to load data:', err);
        this.loading.hide();
      }
    });
  }

  getName(id:number){
    if (this.userId === id) {
      return "You"
    } else {
      const user = this.users?.find(u => u.id === id);
      return user ? user.name : '';
    } 
  }

  
  openDialog(){
    this.showDialog = true;
  }

  onExpenseAdded(newExpense: Expense) {
  this.expenses = [newExpense,...this.expenses];
  this.loadData(); // Add new expense to array
 }
  
}