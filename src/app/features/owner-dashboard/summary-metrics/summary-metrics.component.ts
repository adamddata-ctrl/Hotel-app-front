import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-summary-metrics',
  templateUrl: './summary-metrics.component.html',
  styleUrls: ['./summary-metrics.component.css']
})
export class SummaryMetricsComponent implements OnInit {
  public totalRevenue: number = 0;
  public isLoading: boolean = false;

  constructor(private http: HttpClient) {}

  public ngOnInit(): void {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/analytics/total-revenue`).subscribe({
      next: (data) => {
        this.totalRevenue = data?.totalGrossRevenue || 0.00;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('SUMMARY ERROR: Handled gracefully.', err);
        this.totalRevenue = 0.00;
        this.isLoading = false;
      }
    });
  }
}