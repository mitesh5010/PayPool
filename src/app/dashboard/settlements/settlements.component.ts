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
  settlements: DisplaySettlement[] = [];
  error: string | null = null;
  userId!: number;
  showHistroyDialog = false;
  historySettlements: Settlement[] = [];
  verifyDialog = false; 

  constructor(
    private auth: AuthService,
    private apiService: ApiService,
    private settlementService: SettlementService,
    private messageService: MessageService,
    private loading: LoadingService
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getUserId();
    this.loadSettlements();
    this.loadHistory();
  }

  private loadSettlements(): void {
    this.loading.show();
    this.error = null;

    this.loadData()
      .pipe(finalize(() => (this.loading.hide())))
      .subscribe({
        next: (settlements) => {
          this.settlements = settlements;
        },
        error: (err) => {
          console.error('Error loading settlements:', err);
          this.error = 'Failed to load settlements. Please try again.';
        },
      });
  }

  private loadData(): Observable<DisplaySettlement[]> {
    return forkJoin({
      users: this.apiService.getAllUsers(),
      expenses: this.apiService.getAllExpenses(),
      groups: this.apiService.getAllGroups(),
    }).pipe(
      map(({ users, expenses, groups }) => {
        const userGroups = this.filterUserGroups(groups, this.userId);
        return this.calculateAllSettlements(expenses, userGroups, users);
      }),
      catchError((err) => {
        console.error('API Error:', err);
        throw new Error('Failed to load data from server');
      })
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

  private calculateAllSettlements(
    expenses: Expense[],
    groups: Group[],
    users: User[]
  ): DisplaySettlement[] {
    return groups.flatMap((group) =>
      this.settlementService.calculateSettlements(
        expenses,
        group,
        users,
        this.userId
      )
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
    this.verifyDialog = false;
    setTimeout(() => {
    this.verifyDialog = true; // Reopen dialog
  }, 0);
    console.log(`Settling up for amount: ${settlement.amount}`);
    // Your settle-up logic
  }
  showReminder() {
    this.messageService.add({
      severity: 'info',
      summary: 'Reminder',
      detail: `Reminder is sended!`,
    });
  }

  retry(): void {
    this.loadSettlements();
  }
}
