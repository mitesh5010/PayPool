import { Component, OnInit } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { ChartModule } from 'primeng/chart';
import { AuthService } from '../../auth/auth.service';
import { DashboardService } from '../../Service/dashboard.service';
import { forkJoin } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import { LoadingService } from '../../Service/loading.service';
import { PrimeNGModules } from '../../shared/primeng-imports/primeng-imports.module';

interface DashboardStats {
  totalExpenses: number;
  totalYouOwe: number;
  totalOwedToYou: number;
  activeGroupsCount: number;
}

@Component({
  selector: 'app-user-dashboard',
  imports: [ToolbarModule, PrimeNGModules, ChartModule, CurrencyPipe],
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
  
  constructor(private auth: AuthService, private dashboardService: DashboardService, private loading: LoadingService){}
    
  ngOnInit(): void {
    this.loading.show();
    this.userId = this.auth.getUserId();
    this.dashboardService.getConsolidatedStats(this.userId).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading.hide();
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.loading.hide();
      }
    });
  }
  
}
