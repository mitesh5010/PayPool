import {
  Component,
  computed,
  effect,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Expense, Group, User } from '../../../Service/data.model';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { CurrencyPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { ApiService } from '../../../Service/api.service';
import { LoadingService } from '../../../Service/loading.service';

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
  ],
  templateUrl: './view-group.component.html',
  styleUrl: './view-group.component.css',
})
export class ViewGroupComponent implements OnInit {
  readonly visible = input<boolean>(false);
  readonly close = output<void>();
  readonly groups = input<Group[]>([]);
  readonly groupId = input<number | null>(null);
  viewGroup = signal<Group | null>(null);
  readonly allExpenses = input<Expense[]>([]);
  users!: User[];

  tabs: { value: number; title: string }[] = [];

  constructor(private apiService: ApiService,private loading: LoadingService) {
    effect(() => {
      this.viewGroup.set(this.selectedGroup());
    });
  }

  ngOnInit(): void {
    this.loading.show();
    this.apiService.getAllUsers().subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.log('Error on UserData', err),
    });
    this.loading.hide()
    this.tabs = [
      { value: 1, title: 'Expenses' },
      { value: 2, title: 'Members' },
    ];
  }
  filteredExpenses() {
    const expenses = this.allExpenses();
    const groupName = this.viewGroup()?.name;
  
    if (!expenses || !groupName) {
      return []; // Return an empty array if expenses or groupName is undefined
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

  onClose() {
    this.close.emit();
  }
}
