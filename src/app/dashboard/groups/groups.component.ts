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
import { Expense, Group, User } from '../../Service/data.model';
import { AuthService } from '../../auth/auth.service';
import { ViewGroupComponent } from "./view-group/view-group.component";
import { SplitCalculationService } from '../../Service/split-calculation.service';
import { forkJoin } from 'rxjs';
import { LoadingService } from '../../Service/loading.service';

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
  allExpenses!:Expense[];
  showSettleDialog = false;

  constructor(private fb: FormBuilder, private apiService: ApiService, private auth: AuthService, private splitCal: SplitCalculationService, private loading: LoadingService) {}

  ngOnInit() {
    this.loading.show();
    // Replace with real service call
    this.userId = this.auth.getUserId();
    // this.apiService.getAllGroups().subscribe({
    //   next: (data) => {
    //     const allGroups = data.slice().reverse();
    //     this.groups = this.filterUserGroups(allGroups,this.userId).map(group =>{
    //       const {total, youOwe, owedToYou } = this.splitCal.calculateGroupStats(this.allExpenses, group, this.userId)
    //       return { ...group, total, youOwe, owedToYou}
    //     })
    //   },
    //   error: (err) => {
    //     console.error('Failed to load groups:', err);
    //   },
    // });
    // this.apiService.getAllExpenses().subscribe({
    //   next: data => {
    //     this.allExpenses = data
    //   },
    //   error: err => console.log('error! for expenses get:',err)
      
    // })
    // this.apiService.getAllUsers().subscribe({
    //   next: (data) => {
    //     this.allMembers = data;
    //   },
    //   error: (err) => {
    //     console.error('Failed to load users:', err);
    //   },
    // });
    this.loadData()
    
  }
  loadData(){
    this.newGroup = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      members: [[], Validators.required],
    });
    forkJoin({
      users: this.apiService.getAllUsers(),
      allExpenses: this.apiService.getAllExpenses(),
      groups: this.apiService.getAllGroups(),
      settlements: this.apiService.getAllSettlements() 
    }).subscribe({
      next: ({users, allExpenses, groups, settlements})=>{
        this.allMembers = users;
        this.allExpenses = allExpenses;

        const allGroups = groups.slice().reverse();

        this.groups = this.apiService.filterUserGroups(allGroups, this.userId).map(group => {
        const stats = this.splitCal.calculateGroupStats(allExpenses, group, this.userId,settlements.filter(s => s.groupId === group.id));
        this.loading.hide();
        return { ...group, ...stats };
      });
      },
      error: err => console.error('Failed to load data:', err)
    })
  }
  
  openExpenseDialog(groupId: number) {
    this.selectedGroupId = groupId;
    this.showExDialog = true;
  }
  handleExpenseDialogClose(refresh: boolean) {
  this.showExDialog = false;
  if (!refresh) {
    this.loadData();
  }
  }
  openViewGroupDialog(groupId: number) {
    this.selectedGroupId = groupId;
    this.showViewGroupDialog = true;
    this.showSettleDialog = false; 
  }
  viewSettleDialog(groupId: number) {
    this.selectedGroupId = groupId;
    this.showSettleDialog = true;
    this.showViewGroupDialog = false;
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
          this.loadData()
        },
        error: (err) => {
          console.error('Failed to add group:', err);
        },
      });
    }
  }
}
