import { Component } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ListboxModule } from 'primeng/listbox';

@Component({
  selector: 'app-user-dashboard',
  imports: [ToolbarModule, ButtonModule, CardModule, ChartModule, ListboxModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {

}
