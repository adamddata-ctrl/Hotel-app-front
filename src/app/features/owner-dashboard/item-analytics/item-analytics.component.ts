import { Component, OnInit } from '@angular/core';
import { ReportsService, ItemAnalyticsReport } from '../services/reports.service';

@Component({
  selector: 'app-item-analytics',
  templateUrl: './item-analytics.component.html',
  styleUrls: ['./item-analytics.component.css']
})
export class ItemAnalyticsComponent implements OnInit {
  // Establish default evaluation window dates matching your waiter tracking matrices
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth() + 1;

  itemData: ItemAnalyticsReport[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadMonthlyItemPopularityMetrics();
  }

  /**
   * Fires the backend aggregation query to calculate product unit totals
   */
  loadMonthlyItemPopularityMetrics(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reportsService.getMenuPopularityMetrics(this.currentYear, this.currentMonth)
      .subscribe({

       next: (data) => {
          this.itemData = data;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to calculate product unit sales itemization records.';
          this.isLoading = false;
        }
      });
  }
}