import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { forkJoin, map, Observable } from 'rxjs';
import { SplitCalculationService } from './split-calculation.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(
    private apiService: ApiService,
    private splitCalculation: SplitCalculationService
  ) {}
  /// Get consolidated dashboard stats
  getConsolidatedStats(userId: number): Observable<{
    totalExpenses: number;
    totalYouOwe: number;
    totalOwedToYou: number;
    activeGroupsCount: number;
  }> {
    return forkJoin([
      this.apiService.getAllGroups(),
      this.apiService.getAllExpenses(),
      this.apiService.getAllSettlements(),
    ]).pipe(
      map(([groups, expenses, settlements]) => {
        const userGroups = this.apiService.filterUserGroups(groups, userId);

        let totalYouOwe = 0;
        let totalOwedToYou = 0;
        let totalExpenses = 0;
        let activeGroupsCount = 0;

         // Calculate user's share in all expenses (what they participated in)
        expenses.forEach(expense => {
          const userShare = expense.splitDetails.find(s => s.id === userId);
          if (userShare) {
            totalExpenses += userShare.amount;
          }
        });

        // Calculate group-wise balances
        userGroups.forEach(group => {
          const groupSettlements = settlements.filter(s => s.groupId === group.id);
          const stats = this.splitCalculation.calculateGroupStats(
            expenses,
            group,
            userId,
            groupSettlements
          );

          if (stats.youOwe > 0 || stats.owedToYou > 0) {
            activeGroupsCount++;
          }

          totalYouOwe += stats.youOwe;
          totalOwedToYou += stats.owedToYou;
        });
        if (totalOwedToYou) {
          totalExpenses += totalOwedToYou;
        }
        if (totalYouOwe) {
          totalExpenses -= totalYouOwe;
        }

        return {
          totalExpenses,
          totalYouOwe,
          totalOwedToYou,
          activeGroupsCount,
          netBalance: totalOwedToYou - totalYouOwe
        };
      })
    );
  }
}