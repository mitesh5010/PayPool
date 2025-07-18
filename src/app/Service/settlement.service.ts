import { Injectable } from '@angular/core';
import { DisplaySettlement, Expense, Group, Settlement, User } from './data.model';
import { groupBy } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettlementService {
   private readonly BALANCE_THRESHOLD = 0.01; // To handle floating point precision

  constructor() { }

  calculateSettlements(expenses: Expense[], groups: Group[], users: User[], currentUserId: number, existingSettlements: Settlement[] = []): DisplaySettlement[] {
    if (!expenses.length || !users.length) return [];

    const balances = this.calculateBalances(expenses, existingSettlements);
    const settlements = this.createSettlements(balances, 0);
    return this.transformSettlements(settlements, users, currentUserId, 'All');
  }
  calculateGroupSettlements(expenses: Expense[], groups: Group[], users: User[], currentUserId: number, existingSettlements: Settlement[] = []): DisplaySettlement[] {
    if (!expenses.length || !users.length || !groups.length) return [];

    return groups.flatMap(group => {
      const groupExpenses = expenses.filter(e => e.selectedGroupId === group.id);
      const groupSettlements = existingSettlements.filter(s => s.groupId === group.id);
      
      const balances = this.calculateGroupBalances(groupExpenses, groupSettlements);
      const settlements = this.createSettlements(balances, group.id ?? 0);
      return this.transformSettlements(settlements, users, currentUserId, group.name);
    });
  }

  private calculateBalances(expenses: Expense[],  existingSettlements: Settlement[]): Map<number, number> {
     const balances = new Map<number, number>();

    // Filter expenses for the group and calculate balances
    // const groupExpenses = expenses.filter(expense => expense.selectedGroup === group.name);

    expenses.forEach(expense => {
      // Update payer's balance
      balances.set(expense.paidBy, (balances.get(expense.paidBy) || 0) + expense.amount);
      
      // Update participants' balances
      expense.splitDetails.forEach(split => {
        balances.set(split.id, (balances.get(split.id) || 0) - split.amount);
      });
    });
    // Adjust for existing settlements
    existingSettlements
      .filter(s => s.status === 'settled')
      .forEach(settlement => {
        balances.set(settlement.fromId, (balances.get(settlement.fromId) || 0) + settlement.amount);
        balances.set(settlement.toId, (balances.get(settlement.toId) || 0) - settlement.amount);
      });


    return balances;
  }

  private calculateGroupBalances(expenses: Expense[], existingSettlements: Settlement[]): Map<number, number> {
    const balances = new Map<number, number>();

    expenses.forEach(expense => {
      balances.set(expense.paidBy, (balances.get(expense.paidBy) || 0) + expense.amount);
      expense.splitDetails.forEach(split => {
        balances.set(split.id, (balances.get(split.id) || 0) - split.amount);
      });
    });

    existingSettlements
      .filter(s => s.status === 'settled')
      .forEach(settlement => {
        balances.set(settlement.fromId, (balances.get(settlement.fromId) || 0) + settlement.amount);
        balances.set(settlement.toId, (balances.get(settlement.toId) || 0) - settlement.amount);
      });

    return balances;
  }

  private createSettlements(balances: Map<number, number>, groupId: number): Settlement[] {
    
    const debtors: { id: number; amount: number }[] = [];
    const creditors: { id: number; amount: number }[] = [];

     balances.forEach((amount, userId) => {
      if (amount < -this.BALANCE_THRESHOLD) {
        debtors.push({ id: userId, amount: -amount });
      } else if (amount > this.BALANCE_THRESHOLD) {
        creditors.push({ id: userId, amount });
      }
    });

    // Sort by absolute amount (descending)
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    return this.generateSettlements(debtors, creditors, groupId);
  }

  private generateSettlements(
    debtors: { id: number; amount: number }[],
    creditors: { id: number; amount: number }[],
    groupId: number
  ): Settlement[] {
    const settlements: Settlement[] = [];
    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];
      const settleAmount = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        fromId: debtor.id,
        toId: creditor.id,
        amount: settleAmount,
        groupId,
        status: 'pending'
      });

      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;

      if (debtor.amount < 0.01) debtorIndex++;
      if (creditor.amount < 0.01) creditorIndex++;
    }

    return settlements;
  }

  private transformSettlements(
    settlements: Settlement[],
    users: User[],
    currentUserId: number,
    source: string
  ): DisplaySettlement[] {
    const userMap = new Map(users.map(user => [user.id, user]));
    
    return settlements
      .filter(settlement => settlement.fromId === currentUserId || settlement.toId === currentUserId)
      .map(settlement => {
        const fromUser = userMap.get(settlement.fromId);
        const toUser = userMap.get(settlement.toId);
        const isCurrentUserPayer = currentUserId === settlement.fromId;
        const otherUser = isCurrentUserPayer ? toUser : fromUser;
        
        return {
          ...settlement,
          avatar: otherUser?.name?.charAt(0).toUpperCase() || '?',
          title: isCurrentUserPayer 
            ? `You owe ${toUser?.name || 'Unknown'}`
            : `${fromUser?.name || 'Unknown'} owes you`,
          source,
          amount: isCurrentUserPayer ? -settlement.amount : settlement.amount
        };
      });
  }
}


