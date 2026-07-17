import { Component, OnInit } from '@angular/core';
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
  monthlyCharts: MonthlyGroup[] = [];
  isLoading: boolean = false;
  
  // Mapping array index integers cleanly to string names
  private monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(private analyticsService: AnalyticsService) { }

  ngOnInit(): void {
    this.compileAnnualChartMatrix();
  }
  compileAnnualChartMatrix(): void {
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
          const rawItems = groups[monthIndex];
           // Locate the highest single day revenue cap inside this specific month to scale it [3.1]
          const monthPeak = Math.max(...rawItems.map(r => r.salesTotal)) || 1.0;

          return {
            monthName: this.monthNames[monthIndex - 1] || `Month ${monthIndex}`,
            bars: rawItems.map(r => ({
              label: r.timeLabel,
              amount: r.salesTotal,
              scalePercentage: (r.salesTotal / monthPeak) * 100
            }))
          };
        });

        this.isLoading = false;
      },
      error: (err: any) => { 
         console.error('CHART COMPONENT: Failed to download transaction lists.', err);
        this.isLoading = false;
      }
    });
  }
}