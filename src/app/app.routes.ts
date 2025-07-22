import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthGuard, LoginGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./dashboard/expenses/expenses.component').then(m => m.ExpensesComponent),
      },
      {
        path: 'groups',
        loadComponent: () =>
          import('./dashboard/groups/groups.component').then(m => m.GroupsComponent),
      },
      {
        path: 'settlement',
        loadComponent: () =>
          import('./dashboard/settlements/settlements.component').then(m => m.SettlementsComponent),
      }
    ],
  }
];
