import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service';
//cheek
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
    this.ownerEmail = localStorage.getItem('owner_email') || 'manager@hotelpos.com';
    this.synchronizeFinancialMetrics();
  }

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

    this.router.navigate(['/login']);
  }
}