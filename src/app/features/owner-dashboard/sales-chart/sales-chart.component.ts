import { Component, OnInit } from '@angular/core';
// FIX: Corrected your relative path climb to safely step out of the dashboard directories into core services
import { AnalyticsService } from '../../../core/services/analytics.service';

interface ChartBar {
  label: string;
  amount: number;
  scalePercentage: number;
}

interface MonthlyGroup {
  monthName: string;
  bars: ChartBar[];
}

@Component({
  selector: 'app-sales-chart',
  templateUrl: './sales-chart.component.html',
  styleUrls: ['./sales-chart.component.css']
})
export class SalesChartComponent implements OnInit {
  public monthlyCharts: MonthlyGroup[] = [];
  public isLoading: boolean = false;

  // Mapping array integers cleanly to string names
  private monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(private analyticsService: AnalyticsService) {}

  public ngOnInit(): void {
    this.compileAnnualChartMatrix();
  }

  /**
   * Transforms raw backend transactional records into proportional visual chart bar metrics [3.1].
   */
  public compileAnnualChartMatrix(): void {
    this.isLoading = true;
    
    this.analyticsService.fetchDailyMonthBars().subscribe({
      next: (dataset: any[]) => {
        // Group the records by their numeric month tags (1 to 12)
        const groups: { [key: number]: any[] } = {};

        dataset.forEach(item => {
          if (!groups[item.monthNum]) {
            groups[item.monthNum] = [];
          }
          groups[item.monthNum].push(item);
        });

        // Loop through each group and calculate proportional height constraints [3.1]
        this.monthlyCharts = Object.keys(groups).map(key => {
          const monthIndex = parseInt(key, 10);
          const rawItems = groups[monthIndex] || [];
          
          // FIX: Extracted raw sales figures explicitly to prevent -Infinity mathematical failures on empty records
          const salesFigures = rawItems.map(r => r.salesTotal || 0);
          const calculatedMax = salesFigures.length > 0 ? Math.max(...salesFigures) : 0;
          
          // Securely enforce a non-zero denominator ceiling to guarantee error-free graph scaling loops
          const monthPeak = calculatedMax > 0 ? calculatedMax : 1.0;

          return {
            monthName: this.monthNames[monthIndex - 1] || `Month ${monthIndex}`,
            bars: rawItems.map(r => ({
              label: r.timeLabel || '',
              amount: r.salesTotal || 0,
              // Mathematically scales the bar height cleanly relative to the monthly peak transaction day [3.1]
              scalePercentage: Math.min(Math.round(((r.salesTotal || 0) / monthPeak) * 100), 100)
            }))
          };
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('CHART COMPONENT: Failed to download transaction lists.', err);
        this.isLoading = false;
      }
    });
  }
}