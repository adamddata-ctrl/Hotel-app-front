import { Component, OnInit, Input } from '@angular/core';
// FIX: Confirmed parallel folder climb references point directly to your data service layer
import { ReportsService, DailySummary } from '../services/reports.service';

@Component({
  selector: 'app-summary-metrics',
  templateUrl: './summary-metrics.component.html',
  styleUrls: ['./summary-metrics.component.css']
})
export class SummaryMetricsComponent implements OnInit {

  // THE DATA REVENUE PIPELINE BRIDGE CHANNEL [4.1]
  // Dynamically captures the isolated multi-tenant lifetime gross totals from the parent dashboard view
  @Input() public totalRevenue: number = 0.00;

  // Initialize default fallback target date parameters to the current calendar date
  public selectedDate: string = new Date().toISOString().split('T')[0];
  public summaryData: DailySummary | null = null;
  public errorMessage: string = '';
  public isLoading: boolean = false;

  constructor(private reportsService: ReportsService) {}

  public ngOnInit(): void {
    this.loadDailyFinancialSummary();
  }

  /**
   * Captures runtime date picker changes and triggers dashboard data recalculations [4.1].
   */
  public onDateChange(newDate: string): void {
    this.selectedDate = newDate;
    this.loadDailyFinancialSummary();
  }

  /**
   * Pulls localized data metrics matching individual calendar dates cleanly [4.1].
   */
  public loadDailyFinancialSummary(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reportsService.getDailySummary(this.selectedDate).subscribe({
      next: (data) => {
        this.summaryData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('SUMMARY CONTROLLER: Financial data metric calculation stream failed.', err);
        this.errorMessage = 'Could not resolve financial logs for the selected date.';
        this.isLoading = false;
        this.summaryData = null; // Clear out stale historical datasets to prevent data blending errors [4.1]
      }
    });
  }
}