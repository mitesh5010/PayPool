import { Component, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import {  User } from '../Service/data.model';
import { PrimeNGModules } from '../shared/primeng-imports/primeng-imports.module';




@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ SidebarComponent, RouterOutlet, PrimeNGModules],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  user!:User;
  sidebarOpen = signal(true);

  constructor(private auth: AuthService){
  }
  ngOnInit(): void {
    
    const user = this.auth.userSignal();
  if (user) {
    this.user = user;
  } else {
    console.warn('No user loaded in signal');
    this.auth.logout(); // optionally redirect if not logged in
  } 
  }
  
  
  logout(){
    this.auth.logout();
  }
  getInitials(name: string): string {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2) // Take only first 2 initials
    .join('');
}
  toggleSidebar() {
    this.sidebarOpen.update(open => !open);
  }
  
}
