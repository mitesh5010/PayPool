import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path:'',
    redirectTo:'login',
    pathMatch: 'full'
  },
  {
    path:'register',
    component:RegisterComponent
  }
];
