import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ SidebarComponent, RouterOutlet, AvatarModule,
  OverlayPanelModule,
  ButtonModule,
  CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  user!:{name:string, id:number, email:string};
  constructor(private auth: AuthService){
  }
  ngOnInit(): void {
    this.user = this.auth.userSignal() || JSON.parse(localStorage.getItem('user')!); 
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
  
}
