import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  ownerEmail: string = 'manager@hotelpos.com';
  grossRevenue: number = 0.00;
  isLoadingSales: boolean = false;
  salesFetchError: string = '';
   
  constructor( 
    private router: Router,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    // 1. Pull the logged-in owner profile data context from session memory if present
    this.ownerEmail = localStorage.getItem('owner_email') || 'manager@hotelpos.com';
    
    // 2. Call the financial metric stream with built-in safety fallbacks
    this.synchronizeFinancialMetrics();
  }

  /**
   * Coordinates asset balancing requests to stream isolated sales totals from your backend server.
   */
  synchronizeFinancialMetrics(): void {
    this.isLoadingSales = true;
    this.salesFetchError = '';

    try {
      this.analyticsService.getGrossRevenueMetrics().subscribe({
        next: (packet) => {
          this.grossRevenue = packet?.totalGrossRevenue || 0.00;
          this.isLoadingSales = false;
        },
        error: (err) => {
          console.error('ANALYTICS PANEL: Could not retrieve sales summary matrices.', err);
          this.salesFetchError = 'Failed to load financial data records.';
          this.grossRevenue = 0.00;
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

    localStorage.removeItem('cashier_id');
    localStorage.removeItem('cashier_name');
    localStorage.removeItem('selected_waiter_id');
    localStorage.removeItem('selected_waiter_name');
    localStorage.removeItem('owner_email'); 

    // NOTE: We intentionally DO NOT clear 'active_tenant_id' so the workstation
    // kiosk doesn't drop its restaurant identification properties between shifts!
    
    this.router.navigate(['/login']);
  }
}