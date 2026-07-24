import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Core Authentication and Registration Components
import { CashierLoginComponent } from './features/auth/cashier-login/cashier-login.component';
import { TenantSignupComponent } from './features/auth/tenant-signup/tenant-signup.component';

// Cashier POS Registry Panel Components
import { WaiterSelectionComponent } from './features/cashier-register/waiter-selection/waiter-selection.component';
import { OrderTerminalComponent } from './features/cashier-register/order-terminal/order-terminal.component';

// Owner Back-Office and Analytics Components
import { DashboardHomeComponent } from './features/owner-dashboard/dashboard-home/dashboard-home.component';
import { SummaryMetricsComponent } from './features/owner-dashboard/summary-metrics/summary-metrics.component';
import { SalesChartComponent } from './features/owner-dashboard/sales-chart/sales-chart.component';
import { MenuManagementComponent } from './features/owner-dashboard/menu-management/menu-management.component';
import { KitchenScreenComponent } from './features/kitchen-screen/kitchen-screen.component';
import { InventoryManagementComponent } from './features/owner-dashboard/inventory-management/inventory-management.component';

// High-Security Dynamic Multi-Tenant Access Control Guards
import { authGuard } from './core/guards/auth.guards';
import { tenantGuard } from './core/guards/tenant.guard';

const routes: Routes = [
  // 1. Core Authentication Entry Pathways (Duplicates completely purged)
  {
    path: 'login',
    component: CashierLoginComponent
  },
  {
    path: 'register-tenant',
    component: TenantSignupComponent
  },

  // 2. Front-Counter POS Register Workstations
  {
    path: 'register/waiters',
    component: WaiterSelectionComponent,
    canActivate: [tenantGuard, authGuard]
  },
  {
    path: 'register/terminal',
    component: OrderTerminalComponent,
    canActivate: [tenantGuard, authGuard]
  },

  // 3. Back-Office Franchise Management Panels (All original components preserved)
  {
    path: 'owner-dashboard',
    component: DashboardHomeComponent,
    canActivate: [tenantGuard, authGuard],
    children: [
      { path: 'summary-metrics', component: SummaryMetricsComponent },
      { path: 'sales-chart', component: SalesChartComponent },
      { path: 'menu-management', component: MenuManagementComponent },
      { path: 'kitchen-screen', component: KitchenScreenComponent },
      { path: 'inventory-management', component: InventoryManagementComponent }
    ]
  },
  {
    path: 'dashboard/sales-charts',
    component: SalesChartComponent,
    canActivate: [tenantGuard, authGuard]
  },

  // 4. Default System Fallbacks and Wildcards (Standardized to standard '**')
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }