import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InventoryItem {
  id: number;
  itemName: string;
  quantityOnHand: number;
  minStockLevel: number;
  unitOfMeasure: string;
}

interface InventoryActionPayload {
  itemId: number;
  quantityValue: number;
}
@Injectable({
  providedIn: 'root'
})
export class InventoryManagementService {
  
  // Base endpoint matching our running Spring Boot InventoryController mapping contract [3.1]
  //private baseUrl = '/api/inventory-management';

  // Update Line 23
  private baseUrl = `${environment.apiUrl}/api/inventory-management`;
  constructor(private http: HttpClient) { }

  /**
   * Downloads the complete live stock matrix currently available under this workspace tenant.
   * X-Tenant-ID isolation request routing is handled automatically by your Interceptor [3.1]!
   */
  fetchAllStockBalances(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.baseUrl}/items/all`);
  }
   /**
   * Dispatches relative Stock Adjustments (e.g. tracking waste, damages, loss, or quick additions) [3.1].
   */
  submitStockAdjustment(itemId: number, value: number): Observable<InventoryItem> {
    const payload: InventoryActionPayload = { itemId, quantityValue: value };
    return this.http.post<InventoryItem>(`${this.baseUrl}/adjust`, payload);
  }

  /**
   * Submits a definitive manual stocktake audit count to overwrite old balances [3.1].
   */
  submitInventoryCount(itemId: number, absoluteValue: number): Observable<InventoryItem> {
    const payload: InventoryActionPayload = { itemId, quantityValue: absoluteValue };
    return this.http.post<InventoryItem>(`${this.baseUrl}/count`, payload);
  }

  /**
   * 🔥 ADDED: Posts a new raw inventory tracking record to the Spring Boot endpoint [3.1].
   */
  createNewItem(item: Partial<InventoryItem>): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.baseUrl}/items/create`, item);
  }

  /**    * Registers new bulk supplier purchase orders straight into live inventory counts [3.1].
   */
  submitReceivePurchaseOrder(itemId: number, addedValue: number): Observable<InventoryItem> {
    const payload: InventoryActionPayload = { itemId, quantityValue: addedValue };
    return this.http.post<InventoryItem>(`${this.baseUrl}/purchase-order/receive`, payload);
  }


/**
   * 🔥 ADDED: Downloads compiled shift sales aggregates filtered by cashier token [3.1].
   */
  fetchShiftSummaryRecords(cashierId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/shift/summary/${cashierId}`);
  }



   /**
   * 🔥 ADDED: Connects directly to your existing backend menu catalog insertion engine [3.1].
   * Maps cleanly to your Spring Boot MenuController @PostMapping("/add") contract!
   */
  addMenuItemToCatalog(menuItemPayload: { itemName: string; price: number; category: string }): Observable<any> {
    // Hits port 8080 to trigger your menu catalog insert routine safely [3.1]
  
     // Update Line 81 inside addMenuItemToCatalog()
  return this.http.post<any>(`${environment.apiUrl}/api/menu/add`, menuItemPayload);
      
  }
  
}