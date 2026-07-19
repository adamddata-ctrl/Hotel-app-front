import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DailySummary {
  date: string;
  totalRevenue: number;
  totalOrders: number;
}

export interface WaiterReport {
  waiterName: string;
  totalOrders: number;
  totalRevenue: number;
  }

export interface ItemAnalyticsReport {
  itemName: string;
  category: string;
  totalQuantitySold: number;
  totalRevenueGenerated: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private baseUrl = `${environment.apiUrl}/api/analytics`;

  constructor(private http: HttpClient) {}

  
  deleteMenuItemRecord(itemId: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/api/menu-items/${itemId}`);
  }

  getDailySummary(dateStr: string): Observable<DailySummary> {
    const params = new HttpParams().set('date', dateStr);
    return this.http.get<DailySummary>(`${this.baseUrl}/daily-summary`, { params });
  }

 
  getWaiterMonthlyPerformance(year: number, month: number): Observable<WaiterReport[]> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get<WaiterReport[]>(`${this.baseUrl}/waiter-performance`, { params });
  }
   /**
   * Pulls overarching menu tracking matrix items sorted by absolute raw unit transaction volumes
   */
  getMenuPopularityMetrics(year: number, month: number): Observable<ItemAnalyticsReport[]> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get<ItemAnalyticsReport[]>(`${this.baseUrl}/menu-popularity`, { params });
  }
}