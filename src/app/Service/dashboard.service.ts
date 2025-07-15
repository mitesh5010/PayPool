import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { forkJoin, map, Observable } from 'rxjs';
import { Group, Settlement } from './data.model';
import { SplitCalculationService } from './split-calculation.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private apiService: ApiService, private splitCalculation: SplitCalculationService) { }
  /// Get consolidated dashboard stats
  getConsolidatedStats(userId: number): Observable<{
    totalExpenses: number,
    totalYouOwe: number,
    totalOwedToYou: number,
    activeGroupsCount: number
  }> {
    return forkJoin([
      this.apiService.getActiveGroups(userId),
      this.apiService.getAllExpenses(),
      this.apiService.getAllSettlements(),
      this.apiService.getUserExpenses(userId)
    ]).pipe(
      map(([groups, expenses, settlements, userExpenses]) => {
        let totalYouOwe = 0;
        let totalOwedToYou = 0;
        let groupTotals = 0;

        // Calculate totals across all groups
        groups.forEach(group => {
          const stats = this.splitCalculation.calculateGroupStats(expenses, group, userId);
          groupTotals += stats.total;
          
          // Adjust for settlements
          const settlementAdjustments = this.calculateSettlementAdjustments(settlements, group.id!, userId);
          
          totalYouOwe += Math.max(0, stats.youOwe - settlementAdjustments.paidSettlements);
          totalOwedToYou += Math.max(0, stats.owedToYou - settlementAdjustments.receivedSettlements);
        });

        // Total expenses is sum of all expenses paid by the user
        const totalExpenses = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        return {
          totalExpenses,
          totalYouOwe,
          totalOwedToYou,
          activeGroupsCount: groups.length,
          netBalance: totalOwedToYou - totalYouOwe
        };
      })
    );
  }

  private calculateSettlementAdjustments(settlements: Settlement[], groupId: number, userId: number) {
    let paidSettlements = 0;
    let receivedSettlements = 0;

    settlements
      .filter(s => s.groupId === groupId)
      .forEach(settlement => {
        if (settlement.fromId === userId) {
          paidSettlements += settlement.amount;
        } else if (settlement.toId === userId) {
          receivedSettlements += settlement.amount;
        }
      });

    return { paidSettlements, receivedSettlements };
  }
}
