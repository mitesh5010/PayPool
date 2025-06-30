import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { UserDashboardComponent } from './dashboard/user-dashboard/user-dashboard.component';
import { ExpensesComponent } from './dashboard/expenses/expenses.component';
import { GroupsComponent } from './dashboard/groups/groups.component';
import { SettlementsComponent } from './dashboard/settlements/settlements.component';

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
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate:[AuthGuard],
    children:[
      {
        path: '',
        component: UserDashboardComponent
      },
      {
        path: 'expenses',
        component: ExpensesComponent,
      },
      {
        path: 'groups',
        component: GroupsComponent
      },
      {
        path: 'settlement',
        component: SettlementsComponent
      }
    ],
  }
];
