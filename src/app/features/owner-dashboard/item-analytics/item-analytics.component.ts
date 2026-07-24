import { Component, OnInit } from '@angular/core';
// FIX: Harmonized the relative file path climb to point directly to your shared owner-dashboard services directory
import { ReportsService, ItemAnalyticsReport } from '../services/reports.service';

@Component({
  selector: 'app-item-analytics',
  templateUrl: './item-analytics.component.html',
  styleUrls: ['./item-analytics.component.css']
})
export class ItemAnalyticsComponent implements OnInit {
  // Establish default evaluation window dates matching your tracking matrices [3.1]
  public currentYear: number = new Date().getFullYear();
  public currentMonth: number = new Date().getMonth() + 1;

  public itemData: ItemAnalyticsReport[] = [];
  public errorMessage: string = '';
  public isLoading: boolean = false;

  constructor(private reportsService: ReportsService) {}

  public ngOnInit(): void {
    this.loadMonthlyItemPopularityMetrics();
  }

  /**
   * Fires the backend aggregation query to calculate product unit totals [4.1].
   */
  public loadMonthlyItemPopularityMetrics(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reportsService.getMenuPopularityMetrics(this.currentYear, this.currentMonth)
      .subscribe({
        next: (data) => {
          this.itemData = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('ANALYTICS HUB: Failed to calculate product unit sales itemization records.', err);
          this.errorMessage = 'Failed to calculate product unit sales itemization records.';
          this.isLoading = false;
        }
      });
  }
}