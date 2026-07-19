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
  private readonly apiEndpoint = `${environment.apiUrl}/api/analytics/total-revenue`;
  constructor(private http: HttpClient) { }

  /**
   * 
   */
  getGrossRevenueMetrics(): Observable<RevenuePacket> {
    return this.http.get<RevenuePacket>(this.apiEndpoint);
  }

  /**
   * 
   */
  fetchDailyMonthBars(): Observable<any[]> { 
    return this.http.get<any[]>(`${environment.apiUrl}/api/analytics/daily-month-bars`);
  }
}