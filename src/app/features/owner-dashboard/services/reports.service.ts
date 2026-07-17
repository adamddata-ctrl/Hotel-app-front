import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private baseUrl = 'http://localhost:8080/api/analytics';

  constructor(private http: HttpClient) {}

  /**
   * Queries real-time consolidated total cash intake volumes for any specific selected calendar date
   */
 /**
   * Sends an HTTP DELETE command down to your Spring Boot REST controllers to purge a product.
   * Your multi-tenant interceptor will automatically append the active X-Tenant-ID header [3.1]!
   */
  deleteMenuItemRecord(itemId: number): Observable<any> {
    return this.http.delete(`http://localhost:8080/api/menu-items/${itemId}`);
  }


  getDailySummary(dateStr: string): Observable<DailySummary> {
    const params = new HttpParams().set('date', dateStr);
    return this.http.get<DailySummary>(`${this.baseUrl}/daily-summary`, { params });
  }

  /**
   * Fetches full staff performance metrics aggregated across custom monthly calendar parameters
   */
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