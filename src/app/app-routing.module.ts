
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CashierLoginComponent } from './features/auth/cashier-login/cashier-login.component';
import { WaiterSelectionComponent } from './features/cashier-register/waiter-selection/waiter-selection.component';
import { OrderTerminalComponent } from './features/cashier-register/order-terminal/order-terminal.component';
import { DashboardHomeComponent } from './features/owner-dashboard/dashboard-home/dashboard-home.component';
import { SummaryMetricsComponent } from './features/owner-dashboard/summary-metrics/summary-metrics.component';
// 🔥 FIXED 1: Import your genuine InventoryManagementComponent path cleanly
import { InventoryManagementComponent } from './features/owner-dashboard/inventory-management/inventory-management.component';

// 🔥 STEP 3A: Import your two new step-by-step route guards
import { authGuard } from './core/guards/auth.guards';
import { tenantGuard } from './core/guards/tenant.guard';
import { SalesChartComponent } from './features/owner-dashboard/sales-chart/sales-chart.component';
import { MenuManagementComponent } from './features/owner-dashboard/menu-management/menu-management.component';

const routes: Routes = [
  // 1. Root route automatically mounts your touchscreen PIN pad display layout
  { 
    path: 'login', 
    component: CashierLoginComponent 
  },



  // 2. Catch-all fallback redirects empty paths straight into the login component view
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  
  // 3. High-Security Environment: Fully protected checkout pathways
  { 
    path: 'register/waiters', 
    component: WaiterSelectionComponent,
    canActivate: [tenantGuard, authGuard] // 🔥 Enforces tenant verification AND login status checks!
  },
  { 
    path: 'register/terminal', 
    component: OrderTerminalComponent,

     canActivate: [tenantGuard, authGuard] // 🔥 Enforces tenant verification AND login status checks!
  },
  { 
    path: 'owner/dashboard', 
    component: DashboardHomeComponent
    // You can attach an ownerGuard here in the future to protect admin metrics!
  },

 { 
    path: 'owner/inventory', 
    component: MenuManagementComponent,
    canActivate: [tenantGuard, authGuard] // Protects your product forms using your security guards!
  },

  {
    path: 'dashboard/inventory-management',
    component: InventoryManagementComponent
  },

  // Look for your owner dashboard path inside app-routing.module.ts
{ 
  path: 'owner-dashboard', // <-- Check if it is spelled exactly like this
  component: DashboardHomeComponent,
  children: [
    { path: 'summary-metrics', component: SummaryMetricsComponent }
  ]
},

  {
    path: 'dashboard/sales-charts',
    component: SalesChartComponent,
    canActivate: [tenantGuard, authGuard] // 🔥 Protects your chart metrics behind your active security firewalls!
  },
 // 4. Wildcard Catch-all to handle broken links cleanly
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