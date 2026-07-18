import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RevenuePacket {
  tenantId: string;
  totalGrossRevenue: number;
  reconciledAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
 private readonly apiEndpoint = '/api/analytics/total-revenue'
  constructor(private http: HttpClient) { }

  /**
   * Queries your backend endpoints to pull gross multi-tenant balance calculations.
   * X-Tenant-ID tracking parameters are appended automatically by your Interceptor layer [3.1]!
   */
  getGrossRevenueMetrics(): Observable<RevenuePacket> {
    return this.http.get<RevenuePacket>(this.apiEndpoint);
  }

  /**
   * 🔥 ADDED: Pulls comprehensive daily transaction records mapped out by month numerical values.
   * Hits your Spring Boot endpoint on port 8080 smoothly! [3.1]
   */
  fetchDailyMonthBars(): Observable<any[]> {
    return this.http.get<any[]>('/api/analytics/daily-month-bars');
  }
}