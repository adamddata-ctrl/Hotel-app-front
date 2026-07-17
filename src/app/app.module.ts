import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; // Injects HTTP utilities
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TenantInterceptor } from './core/interceptors/tenant.interceptor';
import { CashierLoginComponent } from './features/auth/cashier-login/cashier-login.component';
import { WaiterSelectionComponent } from './features/cashier-register/waiter-selection/waiter-selection.component';
import { OrderTerminalComponent } from './features/cashier-register/order-terminal/order-terminal.component';
import { SummaryMetricsComponent } from './features/owner-dashboard/summary-metrics/summary-metrics.component';
import { WaiterReportsComponent } from './features/owner-dashboard/waiter-reports/waiter-reports.component';
import { ItemAnalyticsComponent } from './features/owner-dashboard/item-analytics/item-analytics.component';
import { DashboardHomeComponent } from './features/owner-dashboard/dashboard-home/dashboard-home.component';
import { MenuManagementComponent } from './features/owner-dashboard/menu-management/menu-management.component'; // Your custom interceptor file
import { HttpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { KitchenScreenComponent } from './features/kitchen-screen/kitchen-screen.component';

import { InventoryManagementComponent } from './features/owner-dashboard/inventory-management/inventory-management.component';
@NgModule({
  declarations: [
    AppComponent,
    CashierLoginComponent,
    WaiterSelectionComponent,
    OrderTerminalComponent,
    SummaryMetricsComponent,
    WaiterReportsComponent,
    ItemAnalyticsComponent,
    DashboardHomeComponent,
    MenuManagementComponent,
    KitchenScreenComponent,
  
    InventoryManagementComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, 
     FormsModule  // Added for backend REST API calls
  ],
   providers: [
   
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TenantInterceptor,
      multi: true // Allows chaining multiple interceptors smoothly
    },
   
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }