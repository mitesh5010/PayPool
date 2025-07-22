import { Injectable } from '@angular/core';
import { Expense, Group, Settlement } from './data.model';

@Injectable({
  providedIn: 'root'
})
export class SplitCalculationService {

  constructor() { }

  calculateGroupStats(expenses: Expense[], group:Group, userId:number, settlements: Settlement[] = []){
   
    if (!expenses || !group || !group.members) {
    return { total: 0, youOwe: 0, owedToYou: 0 };
  }

    const groupExpenses = expenses.filter(e => e.selectedGroupId === group.id);
    const groupSettlements = settlements.filter(s => s.groupId === group.id);

    // Calculate raw amounts before settlements
    let total = 0;
    let rawYouOwe = 0;
    let rawOwedToYou = 0;

    groupExpenses.forEach(exp => {
      total += exp.amount;
      const userSplit = exp.splitDetails.find(s => s.id === userId)?.amount || 0;

      if (exp.paidBy === userId) {
        // You paid - others owe you their shares
        exp.splitDetails.forEach(split => {
          if (split.id !== userId) {
            rawOwedToYou += split.amount;
          }
        });
      } else if (userSplit > 0) {
        // You owe your share to someone else
        rawYouOwe += userSplit;
      }
    });

    // Apply settlement adjustments
    let settledYouOwe = 0;
    let settledOwedToYou = 0;

    groupSettlements.forEach(settlement => {
      if (settlement.fromId === userId) {
        settledYouOwe += settlement.amount;
      } else if (settlement.toId === userId) {
        settledOwedToYou += settlement.amount;
      }
    });

    // Calculate final amounts
    const youOwe = Math.max(0, rawYouOwe - settledYouOwe);
    const owedToYou = Math.max(0, rawOwedToYou - settledOwedToYou);

    return { total, youOwe, owedToYou };
  }
}
