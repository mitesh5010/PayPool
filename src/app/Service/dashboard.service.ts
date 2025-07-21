import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { forkJoin, map, Observable } from 'rxjs';
import { Group, Settlement } from './data.model';
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
        let groupTotals = 0;
        let totalExpenses = 0;
        let activeGroupsCount = 0;

        // Calculate totals across all groups
        userGroups.forEach((group) => {
          const groupSettlements = settlements.filter(
            (s) => s.groupId === group.id
          );
          const stats = this.splitCalculation.calculateGroupStats(
            expenses,
            group,
            userId,
            groupSettlements
          );
          const settlementAdjustments = this.calculateSettlementAdjustments(settlements, group.id!, userId);
          const adjustedYouOwe = Math.max(0, stats.youOwe - settlementAdjustments.paidSettlements);
          const adjustedOwedToYou = Math.max(0, stats.owedToYou - settlementAdjustments.receivedSettlements);
          if (adjustedYouOwe > 0 || adjustedOwedToYou > 0) {
            activeGroupsCount++;
          }
           totalYouOwe += adjustedYouOwe;
          totalOwedToYou += adjustedOwedToYou;
          
        });
        expenses.forEach((exp) => {
          const userShare = exp.splitDetails.find((s) => s.id === userId);
          if (userShare) {
            totalExpenses += userShare.amount;
          }
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
          netBalance: totalOwedToYou - totalYouOwe,
        };
      })
    );
  }

  private calculateSettlementAdjustments(
    settlements: Settlement[],
    groupId: number,
    userId: number
  ) {
    let paidSettlements = 0;
    let receivedSettlements = 0;

    settlements
      .filter((s) => s.groupId === groupId)
      .forEach((settlement) => {
        if (settlement.fromId === userId) {
          paidSettlements += settlement.amount;
        } else if (settlement.toId === userId) {
          receivedSettlements += settlement.amount;
        }
      });

    return { paidSettlements, receivedSettlements };
  }
}
