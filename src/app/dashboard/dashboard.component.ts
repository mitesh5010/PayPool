import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ SidebarComponent, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  user!:[];
  constructor(private auth: AuthService){
  }
  ngOnInit(): void {
    this.user = this.auth.userSignal() || JSON.parse(localStorage.getItem('user')!); 
  }
  
}
