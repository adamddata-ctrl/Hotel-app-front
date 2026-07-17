import { Component, OnInit, Input } from '@angular/core'; // 🔥 FIXED: Injected 'Input' decorator metadata token
import { ReportsService, DailySummary } from '../services/reports.service';

@Component({
  selector: 'app-summary-metrics',
  templateUrl: './summary-metrics.component.html',
  styleUrls: ['./summary-metrics.component.css']
})
export class SummaryMetricsComponent implements OnInit {

  // 🔥 THE DATA REVENUE PIPELINE BRIDGE CHANNEL:
  // Dynamically captures the isolated multi-tenant lifetime gross totals from the parent dashboard view
  @Input() totalRevenue: number = 0.00;

  // Initialize default fallback target date parameters to the current calendar date
  selectedDate: string = new Date().toISOString().split('T')[0];
  summaryData: DailySummary | null = null;
  errorMessage: string = '';
   isLoading: boolean = false;

  constructor(private reportsService: ReportsService) { }

  /**
   * Fires immediate summary evaluations upon screen initialization
   */
  ngOnInit(): void {
    this.loadDailyFinancialSummary();
  }

  /**
   * Listens for changes on the HTML calendar template input element and auto-refreshes data parameters
   */
  onDateChange(newDate: string): void {
    this.selectedDate = newDate;
    this.loadDailyFinancialSummary();
  }
   /**
   * Pulls localized data metrics matching individual calendar dates cleanly
   */
  loadDailyFinancialSummary(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reportsService.getDailySummary(this.selectedDate)
      .subscribe({
        next: (data) => {
          this.summaryData = data;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Could not resolve financial logs for the selected date.';
          this.isLoading = false;
          this.summaryData = null;
         }
      });
  }
}