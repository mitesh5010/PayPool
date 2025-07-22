import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../auth/auth.service';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DisplaySettlement, Expense, Group, Settlement, User } from '../../Service/data.model';
import { ApiService } from '../../Service/api.service';
import { SettlementService } from '../../Service/settlement.service';
import { MessageService } from 'primeng/api';
import { LoadingService } from '../../Service/loading.service';
import { PinVerificationDialogComponent } from '../pin-verification-dialog/pin-verification-dialog.component';
import { PrimeNGModules } from '../../shared/primeng-imports/primeng-imports.module';

@Component({
  selector: 'app-settlements',
  standalone: true,
  imports: [
    CommonModule,
    PrimeNGModules,
    ToastModule,
    PinVerificationDialogComponent
  ],
  templateUrl: './settlements.component.html',
  styleUrls: ['./settlements.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  providers: [MessageService]
})
export class SettlementsComponent implements OnInit {
  userId: number;
  showHistoryDialog = false;
  verifyDialog = false;
  currentSettlement: DisplaySettlement | null = null;
  settlements: DisplaySettlement[] = [];
  historySettlements: Settlement[] = [];
  users: User[] = [];
  groups: Group[] = [];
  expenses: Expense[] = [];
  allSettlements: Settlement[] = [];
  showOverall = true;

  userMap = new Map<number, User>();
  groupMap = new Map<number, Group>();

  constructor(
    private auth: AuthService,
    private apiService: ApiService,
    private settlementService: SettlementService,
    private messageService: MessageService,
    private loading: LoadingService
  ) {
    this.userId = this.auth.getUserId();
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
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
        this.userMap = new Map(users.map(user => [user.id, user]));
        this.groupMap = new Map(groups.map(group => [group.id!, group]));
        this.allSettlements = settlements;
        this.refreshSettlements();
        this.loadHistory();
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load data. Please try again.'
        });
      }
    });
  }

  private loadHistory(): void {
    this.loading.show();
    this.historySettlements = this.allSettlements
  .filter(s => s.status === 'settled' && (s.fromId === this.userId || s.toId === this.userId))
  .reverse();
    this.loading.hide();
  }

  onRemind(settlement: DisplaySettlement): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Reminder',
      detail: `Reminder sent for ${settlement.title}!`
    });
  }

  onSettle(settlement: DisplaySettlement): void {
    if (settlement.amount < 0) {
       if (this.showOverall) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Settle in Group View',
      detail: 'Please switch to group settlements to settle this balance.'
    });
    return;
  }
      this.handleSettleUp(settlement);
      // console.log('click');
      
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Reminder',
        detail: `You are owed ${settlement.amount}.`
      });
    }
  }

  private handleSettleUp(settlement: DisplaySettlement): void {
    this.currentSettlement = settlement;
    if (!this.verifyDialog) {
      this.verifyDialog = true;
    }
  }

  handlePinVerificationSuccess(isValid: boolean): void {
    if (!isValid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid PIN. Please try again.'
      });
      return;
    }

    if (!this.currentSettlement) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No settlement selected.'
      });
      return;
    }

    this.processSettlement(this.currentSettlement);
    this.resetSettlementState();
  }

  private resetSettlementState(): void {
    this.currentSettlement = null;
    this.verifyDialog = false;
  }

  private processSettlement(settlement: DisplaySettlement): void {
    this.loading.show();
    const newSettlement: Settlement = {
      fromId: this.userId,
      toId: settlement.toId,
      amount: Math.abs(settlement.amount), // Always positive
      groupId: settlement.groupId,
      status: 'settled',
      settledAt: new Date()
    };

    this.apiService.postSettlements(newSettlement).subscribe({
      next: (createdSettlement) => {
        this.allSettlements= [...this.allSettlements, createdSettlement]; 
        this.refreshSettlements();
        this.loadHistory();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Settlement completed successfully!'
        });
      },
      error: (err) => {
        console.error('Settlement error:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to complete settlement. Please try again.'
        });
        // Reopen dialog if there was an error
        setTimeout(() => {
          this.currentSettlement = settlement;
          this.verifyDialog = true;
        });
      },
      complete: () => this.loading.hide()
    });
  }

  showOverallSettlements(): void {
    this.showOverall = true;
    this.refreshSettlements();
  }

  showGroupSettlements(): void {
    this.showOverall = false;
    this.refreshSettlements();
  }

  private refreshSettlements(): void {
    if (!this.users || !this.expenses || !this.groups) return;

    this.settlements = this.showOverall
      ? this.settlementService.calculateSettlements(this.expenses, this.groups, this.users, this.userId, this.allSettlements)
      : this.settlementService.calculateGroupSettlements(this.expenses, this.groups, this.users, this.userId, this.allSettlements);
  }

  getUserName(userId: number): string {
  return this.userMap.get(userId)?.name ?? 'Unknown User';
}

getUserEmail(userId: number): string {
  return this.userMap.get(userId)?.email ?? 'unknown@example.com';
}

getGroupName(groupId: number): string {
  return this.groupMap.get(groupId)?.name ?? 'Unknown Group';
}

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}