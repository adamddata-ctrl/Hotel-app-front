import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service'; // 🔥 ADDED: Imports your custom service path node cleanly

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  // Keeps your original layout data tokens functioning perfectly on your UI template view
  ownerEmail: string = 'manager@hotelpos.com';
  grossRevenue: number = 0.00; // 🔥 ADDED: Binds your live backend metrics value property
  isLoadingSales: boolean = false;
  salesFetchError: string = '';
   
  // 🔥 FIXED: Injects both your router framework and financial network channels together
  constructor( 
     private router: Router,
    private analyticsService: AnalyticsService
  ) {}

  


 ngOnInit(): void {
    // 1. Pull the logged-in owner profile data context from session memory if present
    this.ownerEmail = localStorage.getItem('owner_email') || 'manager@hotelpos.com';
    
    // 2. 🔥 FIXED: Call the financial metric stream with built-in safety fallbacks [3.1]
    this.synchronizeFinancialMetrics();
  }

  /**
   * ADDED: Coordinates asset balancing requests to stream isolated sales totals from your backend server [3.1].
   */
  synchronizeFinancialMetrics(): void {
    this.isLoadingSales = true;
    this.salesFetchError = '';

    // 🔥 FIXED: Wrapped your active network stream inside a protective catch configuration 
    // to ensure that any missing analytics tables or network drops won't crash your whole screen layout [3.1]!
    try {
       this.analyticsService.getGrossRevenueMetrics().subscribe({
        next: (packet) => {
          this.grossRevenue = packet?.totalGrossRevenue || 0.00;
          this.isLoadingSales = false;
        },
        error: (err) => {
          console.error('ANALYTICS PANEL: Could not retrieve sales summary matrices.', err);
          this.salesFetchError = 'Failed to load financial data records.';
          this.grossRevenue = 0.00; // Safe baseline fallback value to prevent crashing [3.1]
          this.isLoadingSales = false;
        }
      });

      




    } catch (crashException) {
      console.error('CRITICAL ERROR: Exception caught during analytics sync execution.', crashException);
      this.grossRevenue = 0.00;
      this.isLoadingSales = false;
    }
  }




  executeLogoutWorkflow(): void {
    console.log('🛡️ SECURITY ENGINE: Initiating staff shift rotation flush sequence...');

    // 1. Target and erase individual personal tokens from local browser storage instantly
    localStorage.removeItem('cashier_id');
    localStorage.removeItem('cashier_name');
    localStorage.removeItem('selected_waiter_id');
    localStorage.removeItem('selected_waiter_name');
     // 🔥 FIXED: Erase the manager profile email context cleanly to prevent dashboard URL bounce loops! [3.1]
    localStorage.removeItem('owner_email'); 

    // NOTE: We intentionally DO NOT clear 'active_tenant_id' so the workstation
    // kiosk doesn't drop its restaurant identification properties between shifts!
    
    // 2. Forcefully throw the user layout viewport backward to your secure login layout [3.1]
    this.router.navigate(['/login']);
  }
}