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

@Component({
  selector: 'app-settlements',
  imports: [
    ButtonModule,
    CommonModule,
    DialogModule,
    PinVerificationDialogComponent,
    ToastModule,
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
        this.allSettlements = settlements;
        const userGroups = this.filterUserGroups(groups, this.userId);
        this.settlements = this.calculateDisplaySettlements(expenses, userGroups, users, settlements);
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
    return groups.flatMap(group => 
      this.settlementService.calculateSettlements(
        expenses,
        group,
        users,
        this.userId,
        existingSettlements.filter(s => s.groupId === group.id)
      )
    );
  }

  loadHistory(): void {
    this.loading.show();
    this.apiService.getAllSettlements().subscribe({
      next: (all) => {
        this.historySettlements = all.filter(
          (s) =>
            s.status === 'settled' &&
            (s.fromId === this.userId || s.toId === this.userId)
        );
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
  private refreshSettlements() {
    forkJoin({
      users: this.apiService.getAllUsers(),
      expenses: this.apiService.getAllExpenses(),
      groups: this.apiService.getAllGroups()
    }).subscribe({
      next: ({ users, expenses, groups }) => {
        const userGroups = this.filterUserGroups(groups, this.userId);
        this.settlements = this.calculateDisplaySettlements(expenses, userGroups, users, this.allSettlements);
      },
      error: (err) => {
        console.error('Error refreshing settlements:', err);
      }
    });
  }
}
