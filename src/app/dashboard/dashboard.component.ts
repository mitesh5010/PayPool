import { Component } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ListboxModule } from 'primeng/listbox';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ToolbarModule, ButtonModule, CardModule, ChartModule, ListboxModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  groups = [
    { name: 'Group 1' },
    { name: 'Group 2' },
    { name: 'Group 3' }
  ];
}
