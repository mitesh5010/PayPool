import { Component, OnInit } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ListboxModule } from 'primeng/listbox';
import { Group } from '../../Service/data.model';
import { AuthService } from '../../auth/auth.service';
import { DashboardService } from '../../Service/dashboard.service';
import { forkJoin } from 'rxjs';
import { CurrencyPipe } from '@angular/common';

interface DashboardStats {
  totalExpenses: number;
  totalYouOwe: number;
  totalOwedToYou: number;
  activeGroupsCount: number;
}

@Component({
  selector: 'app-user-dashboard',
  imports: [ToolbarModule, ButtonModule, CardModule, ChartModule, ListboxModule, CurrencyPipe],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {
  userId =0;
  stats: DashboardStats = {
    totalExpenses: 0,
    totalYouOwe: 0,
    totalOwedToYou: 0,
    activeGroupsCount: 0,
  };
  loading = true;
  
  constructor(private auth: AuthService, private dashboardService: DashboardService){}
    
  ngOnInit(): void {
    this.userId = this.auth.getUserId();
    this.dashboardService.getConsolidatedStats(this.userId).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.loading = false;
      }
    });
  }
  
 

}
