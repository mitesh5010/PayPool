import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../auth/auth.service';
import { catchError, finalize, forkJoin, map, Observable } from 'rxjs';
import {
  DisplaySettlement,
  Expense,
  Group,
  Settlement,
  User,
} from '../../Service/data.model';
import { ApiService } from '../../Service/api.service';
import { SettlementService } from '../../Service/settlement.service';
import { DialogModule } from 'primeng/dialog';
import { PinVerificationDialogComponent } from '../pin-verification-dialog/pin-verification-dialog.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { LoadingService } from '../../Service/loading.service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-settlements',
  imports: [
    ButtonModule,
    CommonModule,
    DialogModule,
    PinVerificationDialogComponent,
    ToastModule,
    TagModule
  ],
  templateUrl: './settlements.component.html',
  styleUrl: './settlements.component.css',
  encapsulation: ViewEncapsulation.Emulated,
  providers: [MessageService],
})
export class SettlementsComponent implements OnInit {
  error: string | null = null;
  userId!: number;
  showHistroyDialog = false;
  historySettlements: Settlement[] = [];
  verifyDialog = false; 
  currentSettlement: DisplaySettlement | null = null;
  allSettlements: Settlement[] = [];
  settlements!:DisplaySettlement[];
  users!:User[];
  groups!: Group[];
  expenses!: Expense[];

  showOverall = true;

  constructor(
    private auth: AuthService,
    private apiService: ApiService,
    private settlementService: SettlementService,
    private messageService: MessageService,
    private loading: LoadingService
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getUserId();
    this.loadData();
    this.loadHistory();
  }

  private loadData():void {
    this.loading.show();
     forkJoin({
      users: this.apiService.getAllUsers(),
      expenses: this.apiService.getAllExpenses(),
      groups: this.apiService.getAllGroups(),
      settlements: this.apiService.getAllSettlements()
    }).pipe(
      finalize(() => this.loading.hide())
    ).subscribe({
      next: ({ users, expenses, groups, settlements }) => {
        this.users = users;
        this.expenses = expenses;
        this.groups = groups;
        this.allSettlements = settlements;
        // const userGroups = this.filterUserGroups(groups, this.userId);
        this.settlements = this.calculateDisplaySettlements(expenses, groups, users, settlements);
        this.loadHistory();
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error = 'Failed to load data. Please try again.';
      }
    });
  }
   private calculateDisplaySettlements(
    expenses: Expense[],
    groups: Group[],
    users: User[],
    existingSettlements: Settlement[]
  ): DisplaySettlement[] {
    return this.settlementService.calculateSettlements(
        expenses,
        groups,
        users,
        this.userId,
        existingSettlements
      )
  
  }

  loadHistory(): void {
    this.loading.show();
    this.apiService.getAllSettlements().subscribe({
      next: (all) => {
        this.historySettlements = all.filter(
          (s) =>
            s.status === 'settled' &&
            (s.fromId === this.userId || s.toId === this.userId)
        ).slice().reverse();
        this.loading.hide();
      },
      error: (err) => {
        console.error('Failed to load history:', err);
        this.loading.hide();
      },
    });
  }

  private filterUserGroups(allGroups: Group[], userId: number): Group[] {
    return allGroups.filter(
      (group) =>
        group.userId === userId ||
        group.members.some((member) => member.id === userId)
    );
  }

  onRemind(settlement: DisplaySettlement): void {
    console.log('Remind clicked for settlement:', settlement);
    // TODO: Implement remind functionality
  }

  onSettle(settlement: DisplaySettlement) {
    if (settlement.amount < 0) {
      this.handleSettleUp(settlement);
    } else if (settlement.amount > 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Reminder',
        detail: `You are owed ${settlement.amount}.`,
      });
    }
  }

  handleSettleUp(settlement: DisplaySettlement) {
    this.currentSettlement = settlement;
    this.verifyDialog = false;
    setTimeout(() => {
    this.verifyDialog = true; // Reopen dialog
  }, 0);
    console.log(`Settling up for amount: ${settlement.amount}`);
    // Your settle-up logic
  }
  handlePinVerificationSuccess(isValid: boolean) {
    if (isValid && this.currentSettlement) {
      this.processSettlement(this.currentSettlement);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid PIN. Please try again.',
      });
    }
    this.currentSettlement = null;
  }
  private processSettlement(settlement: DisplaySettlement) {
    this.loading.show();
    
    const newSettlement: Settlement = {
      fromId: this.userId,
      toId: settlement.toId,
      amount: Math.abs(settlement.amount),
      groupId: settlement.groupId,
      status: 'settled',
      settledAt: new Date()
    };

    this.apiService.postSettlements(newSettlement).subscribe({
      next: (createdSettlement) => {
        this.allSettlements = [...this.allSettlements, createdSettlement];
        this.refreshSettlements();
        this.loadHistory();
        this.verifyDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Settlement completed successfully!',
        });
      },
      error: (err) => {
        console.error('Settlement error:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to complete settlement. Please try again.',
        });
      },
      complete: () => this.loading.hide()
    });
  }
  showReminder() {
    this.messageService.add({
      severity: 'info',
      summary: 'Reminder',
      detail: `Reminder is sended!`,
    });
  }
  // private refreshSettlements() {
  //   forkJoin({
  //     users: this.apiService.getAllUsers(),
  //     expenses: this.apiService.getAllExpenses(),
  //     groups: this.apiService.getAllGroups()
  //   }).subscribe({
  //     next: ({ users, expenses, groups }) => {
  //       const userGroups = this.filterUserGroups(groups, this.userId);
  //       this.settlements = this.calculateDisplaySettlements(expenses, userGroups, users, this.allSettlements);
  //     },
  //     error: (err) => {
  //       console.error('Error refreshing settlements:', err);
  //     }
  //   });
  // }

  showOverallSettlements() {
  this.showOverall = true;
  this.refreshSettlements();
}

showGroupSettlements() {
  this.showOverall = false;
  this.refreshSettlements();
}

private refreshSettlements() {
    if (!this.users || !this.expenses || !this.groups) return;

    if (this.showOverall) {
      // Calculate overall settlements
      this.settlements = this.settlementService.calculateSettlements(
        this.expenses,
        this.groups,
        this.users,
        this.userId,
        this.allSettlements
      );
    } else {
      // Calculate group-wise settlements
      const userGroups = this.filterUserGroups(this.groups, this.userId);
      this.settlements = this.settlementService.calculateGroupSettlements(
        this.expenses,
        userGroups,
        this.users,
        this.userId,
        this.allSettlements
      );
    }
  }

  //settlements Histroy
  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  }

  getUserEmail(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.email : 'unknown@example.com';
  }
  getGroupName(groupId: number): string {
    const group = this.groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown Group';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}
