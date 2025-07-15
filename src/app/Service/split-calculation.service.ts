import { Injectable } from '@angular/core';
import { Expense, Group, Settlement } from './data.model';

@Injectable({
  providedIn: 'root'
})
export class SplitCalculationService {

  constructor() { }

  calculateGroupStats(expenses: Expense[], group:Group, userId:number, settlements: Settlement[] = []){
    let total = 0;
    let youOwe = 0;
    let owedToYou = 0;
    if (!expenses || !group || !group.members) {
    return { total: 0, youOwe: 0, owedToYou: 0 };
  }

    const groupExpenses = expenses.filter(e => e.selectedGroup === group.name);
    // Filter settlements for this group
    const groupSettlements = settlements.filter(s => s.groupId === group.id);

    groupExpenses.forEach(exp => {
      total += exp.amount;

      const userSplit = exp.splitDetails.find(s => s.id === userId)?.amount || 0;

      // You didn't pay, but owe part of it
      if (userSplit > 0 && exp.paidBy !== userId) {
        youOwe += userSplit;
      }
      // You paid (you are the creator), others owe you
      if (exp.paidBy === userId) {
        exp.splitDetails.forEach(split => {
          if (split.id !== userId) {
            owedToYou += split.amount;
          }
        });
      }
    });
    groupSettlements.forEach(settlement => {
      if (settlement.fromId === userId) {
        // You paid to someone (reduces what you owe)
        youOwe = Math.max(0, youOwe - settlement.amount);
      } else if (settlement.toId === userId) {
        // Someone paid you (reduces what's owed to you)
        owedToYou = Math.max(0, owedToYou - settlement.amount);
      }
    });
    return {total, youOwe, owedToYou};
  }
}
