import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { GlobalLoadingComponent } from "./shared/global-loading/global-loading.component";
import { LoadingService } from './Service/loading.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalLoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'PayPool';
  constructor(private auth: AuthService,private router: Router, private loading: LoadingService){
    this.router.events.subscribe(event => {
    if (event instanceof NavigationStart) {
      this.loading.show();
    } else if (event instanceof NavigationEnd) {
      setTimeout(() => this.loading.hide(), 300);
    }
  });
  }

  ngOnInit(): void {
    this.auth.initializeUserFromToken();
  }
  

}
