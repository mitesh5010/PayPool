import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import {  MenuModule } from 'primeng/menu';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ApiService, Group, User } from '../../Service/api.service';
import { AddExpenseDialogComponent } from "../expenses/add-expense-dialog/add-expense-dialog.component";


@Component({
  selector: 'app-groups',
  imports: [ButtonModule, MenuModule, CommonModule, CardModule, DividerModule, DialogModule, InputText, MultiSelectModule, ReactiveFormsModule, AddExpenseDialogComponent],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
  encapsulation: ViewEncapsulation.None

})
export class GroupsComponent implements OnInit {
  groups!: Group[];
  showGroupDialog = false;
  showExDialog = false;
  newGroup!: FormGroup;
  allMembers!:User[];
  id!:number;
  selectedGroupId:number = 0;

  constructor(private fb: FormBuilder, private apiService: ApiService){}

  ngOnInit() {
    // Replace with real service call
    this.apiService.getAllGroups().subscribe({
      next: (data) => {
        this.groups = data.slice().reverse();
      },
      error: (err) => {
        console.error('Failed to load groups:', err);
      }
    });
    this.apiService.getAllUsers().subscribe({
      next: (data) => {
        this.allMembers = data;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      }
    });
    this.newGroup = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      members: [[], Validators.required]
    });  
  }
  getUserId(): number {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).id : 0;
  }

  viewGroup(id: number) {
    // Navigate to group details
  }
  openExpenseDialog(groupId: number) {
  this.selectedGroupId = groupId;
  this.showExDialog = true;
}

  addExpense(id: number) {
    // Open add expense dialog/modal
  }
  
  submitGroup(){
    if (this.newGroup.valid) {
      const formValue = this.newGroup.value;

      const newGroup: Group ={
        name: formValue.name,
        description: formValue.description || '',
        status: 'ACTIVE',
        userId: this.getUserId(),
        members: formValue.members.map((member: User) => ({ name: member.name, email: member.email })),
        total: 0,
        youOwe: 0,
        owedToYou: 0
      };
      this.apiService.addGroup(newGroup).subscribe({
        next: (data) => {
          this.groups = [...this.groups, data];
          this.showGroupDialog = false;
          this.newGroup.reset();
        },
        error: (err) => {
          console.error('Failed to add group:', err);
        }
      });
      
    }
  }
}
