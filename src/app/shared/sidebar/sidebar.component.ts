import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ButtonModule } from 'primeng/button';
import { filter } from 'rxjs/operators';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    PanelMenuModule,
    ButtonModule,
    RippleModule,
    TooltipModule,
    StyleClassModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() isOpen = true;
  @Output() isOpenChange = new EventEmitter<boolean>();
  activeRoute = '';

  constructor(private router: Router){
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.activeRoute = event.urlAfterRedirects || event.url;
      });
  }

  menuItems = [
    { label: 'Dashboard', icon: 'pi pi-chart-line', routerLink: '/dashboard' },
    { label: 'Groups', icon: 'pi pi-users', routerLink: '/dashboard/groups' },
    { label: 'Expenses', icon: 'pi pi-sort-alt', routerLink: '/dashboard/expenses' },
    { label: 'Settle', icon: 'pi pi-wallet', routerLink: '/dashboard/settlement' }
  ];

  toggleSidebar() {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
  isActive(route: string): boolean {
    return this.activeRoute === route;
  }
}