import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RevenuePacket {
  tenantId: string;
  totalGrossRevenue: number;
  reconciledAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  // FIX: Converted single quotes to backticks (`) to allow the environment variables to parse correctly
  private readonly apiEndpoint = `${environment.apiUrl}/analytics/total-revenue`;

  constructor(private http: HttpClient) {}

  /**
   * Queries real-time gross performance tracking cards from your database partition.
   */
  public getGrossRevenueMetrics(): Observable<RevenuePacket> {
    return this.http.get<RevenuePacket>(this.apiEndpoint);
  }

  /**
   * FIX: Corrected method spelling from 'Bars' to match your components exactly, 
   * removed invalid single quotes, and updated the endpoint path with hyphens.
   */
  public fetchDailyMonthBars(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/analytics/daily-month-bars`);
  }
}