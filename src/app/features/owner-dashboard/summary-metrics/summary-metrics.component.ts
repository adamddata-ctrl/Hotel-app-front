import { Component, OnInit } from '@angular/core';
import { ReportsService, DailySummary } from '../services/reports.service';

@Component({
  selector: 'app-summary-metrics',
  templateUrl: './summary-metrics.component.html',
  styleUrls: ['./summary-metrics.component.css']
})
export class SummaryMetricsComponent implements OnInit {
  // Initialize default fallback target date parameters to the current calendar date
  selectedDate: string = new Date().toISOString().split('T')[0];
  summaryData: DailySummary | null = null;
  errorMessage: string = '';
  isLoading: boolean = false;
   constructor(private reportsService: ReportsService) {}

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