import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import {  FormGroup } from '@angular/forms';
import { ApiService} from '../../Service/api.service';
import { AddExpenseDialogComponent } from "./add-expense-dialog/add-expense-dialog.component";
import { Category, Expense, Group, User } from '../../Service/data.model';
import { AuthService } from '../../auth/auth.service';
import { LoadingService } from '../../Service/loading.service';

interface NameUser extends User {
  name: string
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
    this.apiService.getAllExpenses().subscribe({
    next: (data) => {
      this.expenses = data.filter(exp =>
          exp.splitDetails.some(split => split.id === this.userId)
        )
        .reverse();
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
  this.loading.hide();
  }

  getName(id:number){
    if (this.userId === id) {
      return "You"
    } else {
      const user = this.users.find(u => u.id === id);
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
