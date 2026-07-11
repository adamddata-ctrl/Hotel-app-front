import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CashierLoginComponent } from './features/auth/cashier-login/cashier-login.component';
import { WaiterSelectionComponent } from './features/cashier-register/waiter-selection/waiter-selection.component';
import { OrderTerminalComponent } from './features/cashier-register/order-terminal/order-terminal.component';
import { DashboardHomeComponent } from './features/owner-dashboard/dashboard-home/dashboard-home.component';

const routes: Routes = [
  // 1. Root route automatically mounts your touchscreen PIN pad display layout
  { path: 'login', component: CashierLoginComponent },

  // 2. Catch-all fallback redirects empty paths straight into the login component view
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 3. Operational routing paths for subsequent workflow modules (Placeholder targets)
 // { path: 'register/waiters', redirectTo: 'login', pathMatch: 'full' }
{ path: 'register/waiters', component: WaiterSelectionComponent },
 { path: 'register/terminal', component: OrderTerminalComponent },
  { path: 'owner/dashboard', component: DashboardHomeComponent }

];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }