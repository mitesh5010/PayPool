import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ApiService } from '../../Service/api.service';
import { AddExpenseDialogComponent } from '../expenses/add-expense-dialog/add-expense-dialog.component';
import { Expense, Group, User } from '../../Service/data.model';
import { AuthService } from '../../auth/auth.service';
import { ViewGroupComponent } from "./view-group/view-group.component";
import { SplitCalculationService } from '../../Service/split-calculation.service';
import { forkJoin } from 'rxjs';
import { LoadingService } from '../../Service/loading.service';
import { PrimeNGModules } from '../../shared/primeng-imports/primeng-imports.module';

@Component({
  selector: 'app-groups',
  imports: [
    CommonModule,
    PrimeNGModules,
    ReactiveFormsModule,
    AddExpenseDialogComponent,
    ViewGroupComponent
],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class GroupsComponent implements OnInit {
  groups: Group[] = [];
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
  isLoading = true;

  constructor(private fb: FormBuilder, private apiService: ApiService, private auth: AuthService, private splitCal: SplitCalculationService, private loading: LoadingService) {}

  ngOnInit() {
    this.userId = this.auth.getUserId();
    this.loadData()
    
  }
  loadData(){
    this.isLoading = true; // Set loading state
    this.loading.show(); // Show visual spinner

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
        const isSettled = stats.youOwe === 0 && stats.owedToYou === 0;
        return { ...group, ...stats, status: isSettled ? 'SETTLED' : 'ACTIVE' };
      });
      this.isLoading = false;
      this.loading.hide();
      },
      error: err => {
        console.error('Failed to load data:', err);
        this.isLoading = false;
        this.loading.hide();
      }
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
        status: 'SETTLED',
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
  handleSettlementComplete() {
    this.loadData(); // ✅ refresh group data and status
  }
}
