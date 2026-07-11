import { Component, OnInit } from '@angular/core';
import { ReportsService, WaiterReport } from '../services/reports.service';

@Component({
  selector: 'app-waiter-reports',
  templateUrl: './waiter-reports.component.html',
  styleUrls: ['./waiter-reports.component.css']
})
export class WaiterReportsComponent implements OnInit {
  // Establish default evaluation window dates to the current month configuration matrix
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth() + 1; // JS months are zero-indexed
  
  waiterData: WaiterReport[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private reportsService: ReportsService) {}

   ngOnInit(): void {
    this.loadMonthlyWaiterPerformanceData();
  }

  /**
   * Fires the backend aggregation query using custom year/month criteria inputs
   */
  loadMonthlyWaiterPerformanceData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reportsService.getWaiterMonthlyPerformance(this.currentYear, this.currentMonth)
      .subscribe({
        next: (data) => {
          this.waiterData = data;
          this.isLoading = false;
        },
         error: () => {
          this.errorMessage = 'Failed to calculate waiter productivity ledger reports.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Fast data portability engine: Automatically parses the active data table array matrix 
   * into a formatted .csv download file string packet for Excel mapping.
   */
  exportReportToCSV(): void {
    if (this.waiterData.length === 0) return;

    // Define header layout markers
     let csvRows = ['Waiter Name,Total Orders Taken,Total Revenue Generated\n'];

    // Map each transactional object data entity to comma-delimited text rows
    this.waiterData.forEach(row => {
      csvRows.push(`"${row.waiterName}",${row.totalOrders},${row.totalRevenue}\n`);
    });

    // Create a virtual file object link trigger to force native system browser download pipelines
    const blob = new Blob(csvRows, { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const linkElement = document.createElement('a');
    
    linkElement.href = downloadUrl;
    linkElement.setAttribute('download', `Waiter_Performance_Report_${this.currentMonth}_${this.currentYear}.csv`);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  }
}