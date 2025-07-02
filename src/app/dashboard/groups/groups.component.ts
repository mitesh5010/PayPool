import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import {  MenuModule } from 'primeng/menu';
import { DividerModule } from 'primeng/divider';

export interface Group {
  id: number;
  name: string;
  status: 'ACTIVE' | 'SETTLED';
  members: { name: string; email: string }[];
  total: number;
  youOwe: number;
  owedToYou: number;
}

@Component({
  selector: 'app-groups',
  imports: [ButtonModule, MenuModule, CommonModule, CardModule, DividerModule],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
  encapsulation: ViewEncapsulation.None

})
export class GroupsComponent {
  groups: Group[] = [];

  ngOnInit() {
    // Replace with real service call
    this.groups = [
      {
        id: 1,
        name: 'Weekend Trip',
        status: 'ACTIVE',
        members: [{ name: 'A', email: '' }, { name: 'B', email: '' }],
        total: 856,
        youOwe: 142,
        owedToYou: 28
      },
      {
        id: 2,
        name: 'sunday Trip',
        status: 'SETTLED',
        members: [{ name: 'A', email: '' }, { name: 'B', email: '' }],
        total: 578,
        youOwe: 142,
        owedToYou: 236
      },
    ];
  }

  viewGroup(id: number) {
    // Navigate to group details
  }

  addExpense(id: number) {
    // Open add expense dialog/modal
  }
}
