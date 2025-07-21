import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  input,
  OnInit,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { DisplaySettlement, Expense, Group, Settlement, User } from '../../../Service/data.model';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { ApiService } from '../../../Service/api.service';
import { LoadingService } from '../../../Service/loading.service';
import { MessageService } from 'primeng/api';
import { PinVerificationDialogComponent } from "../../pin-verification-dialog/pin-verification-dialog.component";
import { SettlementService } from '../../../Service/settlement.service';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { Toast } from "primeng/toast";

@Component({
  selector: 'app-view-group',
  imports: [
    Dialog,
    ButtonModule,
    TabsModule,
    AvatarModule,
    DividerModule,
    CurrencyPipe,
    CardModule,
    BadgeModule,
    CommonModule,
    PinVerificationDialogComponent,
    Toast
],
  providers: [MessageService],
  templateUrl: './view-group.component.html',
  styleUrl: './view-group.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ViewGroupComponent implements OnInit {
  readonly visible = input<boolean>(false);
  readonly close = output<void>();
  readonly groups = input<Group[]>([]);
  readonly groupId = input<number | null>(null);
  viewGroup = signal<Group | null>(null);
  readonly allExpenses = input<Expense[]>([]);
  users: User[] = [];
  verifyDialog = false;
  currentSettlement: DisplaySettlement | null = null;
  filteredSettlements = signal<DisplaySettlement[]>([]);

  tabs: { value: number; title: string }[] = [];

  constructor(
    private apiService: ApiService,
    private loading: LoadingService, 
    private messageService: MessageService, 
    private settlementService: SettlementService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      this.viewGroup.set(this.selectedGroup());
      if (this.viewGroup()) {
        this.loadGroupSettlements();
      }
    });
  }

  ngOnInit(): void {
    this.loading.show();
    this.apiService.getAllUsers().subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.log('Error on UserData', err),
      complete: () => this.loading.hide()
    });
    
    this.tabs = [
      { value: 1, title: 'Expenses' },
      { value: 2, title: 'Members' },
      { value: 3, title: 'Settle Up' },
    ];
  }

  filteredExpenses() {
    const expenses = this.allExpenses();
    const groupName = this.viewGroup()?.name;
  
    if (!expenses || !groupName) {
      return [];
    }
  
    return expenses.filter((e) => e.selectedGroup === groupName);
  }

  getUserName(split: { id: number; email: string }): string {
    const user = this.users?.find(
      (u) => u.id === split.id || u.email === split.email
    );
    return user ? user.name : split.email;
  }

  selectedGroup = computed(() => {
    if (!this.groupId()) {
      return null;
    }
    return this.groups().find((group) => group.id === this.groupId()) || null;
  });

  private loadGroupSettlements(): void {
    this.loading.show();
    forkJoin({
      expenses: this.apiService.getAllExpenses(),
      settlements: this.apiService.getAllSettlements()
    }).subscribe({
      next: ({ expenses, settlements }) => {
        this.filteredSettlements.set(
          this.settlementService.calculateGroupSettlements(
            expenses,
            [this.viewGroup()!],
            this.users,
            this.auth.getUserId(),
            settlements
          )
        );
      },
      error: (err) => {
        console.error('Error loading settlements:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load group settlements'
        });
      },
      complete: () => this.loading.hide()
    });
  }

  onRemind(settlement: DisplaySettlement): void {
    event?.preventDefault();
    this.messageService.add({
      severity: 'info',
      summary: 'Reminder',
      detail: `Reminder sent for ${settlement.title}!`
    });
  }

  onSettle(settlement: DisplaySettlement): void {
    if (settlement.amount < 0) {
      this.handleSettleUp(settlement);
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
    this.verifyDialog = true;
    this.cdr.detectChanges();
  }

  handlePinVerificationSuccess(isValid: boolean): void {
    if (!isValid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid PIN. Please try again.'
      });
      this.resetSettlementState();
      return;
    }

    if (!this.currentSettlement) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No settlement selected.'
      });
      this.resetSettlementState();
      return;
    }

    this.processSettlement(this.currentSettlement);
    this.resetSettlementState();
  }

  private resetSettlementState(): void {
    this.currentSettlement = null;
    this.verifyDialog = false;
  }

  onClosePinDialog(): void {
    this.resetSettlementState();
  }

  private processSettlement(settlement: DisplaySettlement): void {
    this.loading.show();
    const newSettlement: Settlement = {
      fromId: this.auth.getUserId(),
      toId: settlement.toId,
      amount: Math.abs(settlement.amount), // Always positive
      groupId: this.viewGroup()?.id!,
      status: 'settled',
      settledAt: new Date()
    };

    this.apiService.postSettlements(newSettlement).subscribe({
      next: (createdSettlement) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Settlement completed successfully!'
        });
        this.loadGroupSettlements();
      },
      error: (err) => {
        console.error('Settlement error:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to complete settlement. Please try again.'
        });
      },
      complete: () => this.loading.hide()
    });
  }

  onClose() {
    this.close.emit();
  }
}