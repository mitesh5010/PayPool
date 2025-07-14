import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../auth/auth.service';
import { catchError, finalize, forkJoin, map, Observable } from 'rxjs';
import { DisplaySettlement, Expense, Group, Settlement, User } from '../../Service/data.model';
import { ApiService } from '../../Service/api.service';
import { SettlementService } from '../../Service/settlement.service';
import { DialogModule } from 'primeng/dialog';


@Component({
  selector: 'app-settlements',
  imports: [ButtonModule, CommonModule, DialogModule],
  templateUrl: './settlements.component.html',
  styleUrl: './settlements.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class SettlementsComponent implements OnInit {

  settlements: DisplaySettlement[] = [];
  loading = false;
  error: string | null = null;
  userId !:number; 
  showHistroyDialog = false;
  historySettlements: Settlement[] = [];

  constructor(
    private auth: AuthService,
    private apiService: ApiService,
    private settlementService: SettlementService
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getUserId();
    this.loadSettlements();
    this.loadHistory();
  }

  private loadSettlements(): void {
    this.loading = true;
    this.error = null;

    this.loadData().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (settlements) => {
        this.settlements = settlements;
      },
      error: (err) => {
        console.error('Error loading settlements:', err);
        this.error = 'Failed to load settlements. Please try again.';
      }
    });
  }

  private loadData(): Observable<DisplaySettlement[]> {
    return forkJoin({
      users: this.apiService.getAllUsers(),
      expenses: this.apiService.getAllExpenses(),
      groups: this.apiService.getAllGroups()
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
  this.apiService.getAllSettlements().subscribe({
    next: (all) => {
      this.historySettlements = all.filter(
        s => s.status === 'settled' && (s.fromId === this.userId || s.toId === this.userId)
      );
    },
    error: (err) => {
      console.error('Failed to load history:', err);
    }
  });
}

  private filterUserGroups(allGroups: Group[], userId: number): Group[] {
    return allGroups.filter(group =>
      group.userId === userId || group.members.some(member => member.id === userId)
    );
  }

  private calculateAllSettlements(expenses: Expense[], groups: Group[], users: User[]): DisplaySettlement[] {
    return groups.flatMap(group => 
      this.settlementService.calculateSettlements(expenses, group, users, this.userId)
    );
  }

  onRemind(settlement: DisplaySettlement): void {
    console.log('Remind clicked for settlement:', settlement);
    // TODO: Implement remind functionality
  }

  onSettle(settlement: DisplaySettlement): void {
    console.log('Settle clicked for settlement:', settlement);
    // TODO: Implement settle functionality
  }

  retry(): void {
    this.loadSettlements();
  }
  
}
