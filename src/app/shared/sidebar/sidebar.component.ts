import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [SidebarModule, CommonModule, MenuModule, RouterLinkActive, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {

  navLinks = [
  { title: 'Dashboard', path: '/dashboard', exact: true },
  { title: 'Expenses', path: '/dashboard/expenses' },
  { title: 'Groups', path: '/dashboard/groups' },
  { title: 'Settlements', path: '/dashboard/settlement' }
];
}
