import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MenuModule } from 'primeng/menu';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ApiService } from '../../Service/api.service';
import { AddExpenseDialogComponent } from '../expenses/add-expense-dialog/add-expense-dialog.component';
import { Group, User } from '../../Service/data.model';
import { AuthService } from '../../auth/auth.service';
import { ViewGroupComponent } from "./view-group/view-group.component";

@Component({
  selector: 'app-groups',
  imports: [
    ButtonModule,
    MenuModule,
    CommonModule,
    CardModule,
    DividerModule,
    DialogModule,
    InputText,
    MultiSelectModule,
    ReactiveFormsModule,
    AddExpenseDialogComponent,
    ViewGroupComponent
],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class GroupsComponent implements OnInit {
  groups!: Group[];
  showGroupDialog = false;
  showViewGroupDialog = false;
  showExDialog = false;
  newGroup!: FormGroup;
  allMembers!: User[];
  id!: number;
  selectedGroupId: number = 0;
  userId: number = 0;

  constructor(private fb: FormBuilder, private apiService: ApiService, private auth: AuthService) {}

  ngOnInit() {
    // Replace with real service call
    this.userId = this.auth.getUserId();
    this.apiService.getAllGroups().subscribe({
      next: (data) => {
        const allGroups = data.slice().reverse();
        this.groups = allGroups.filter(
          (group) => group.userId === this.userId || group.members.some((m) => m.id === this.userId)
        );
      },
      error: (err) => {
        console.error('Failed to load groups:', err);
      },
    });
    this.apiService.getAllUsers().subscribe({
      next: (data) => {
        this.allMembers = data;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      },
    });
    this.newGroup = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      members: [[], Validators.required],
    });
  }
  filterUserGroups(allGroups: Group[], userId: number): Group[] {
  return allGroups.filter(group =>
    group.userId === userId || group.members.some(member => member.id === userId)
  );
}
  
  viewGroup(id: number) {
    // Navigate to group details
  }
  openExpenseDialog(groupId: number) {
    this.selectedGroupId = groupId;
    this.showExDialog = true;
  }
  openViewGroupDialog(groupId: number) {
    this.selectedGroupId = groupId;
    this.showViewGroupDialog = true;
  }

  addExpense(id: number) {
    // Open add expense dialog/modal
  }

  submitGroup() {
    if (this.newGroup.valid) {
      const formValue = this.newGroup.value;

      const newGroup: Group = {
        name: formValue.name,
        description: formValue.description || '',
        status: 'ACTIVE',
        userId: this.userId,
        members: formValue.members.map((member: User) => ({
          id: member.id,
          name: member.name,
          email: member.email,
        })),
        total: 0,
        youOwe: 0,
        owedToYou: 0,
      };
      this.apiService.addGroup(newGroup).subscribe({
        next: (data) => {
          this.groups = [...this.groups, data];
          this.showGroupDialog = false;
          this.newGroup.reset();
        },
        error: (err) => {
          console.error('Failed to add group:', err);
        },
      });
    }
  }
}
