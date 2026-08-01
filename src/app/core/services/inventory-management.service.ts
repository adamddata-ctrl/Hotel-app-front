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
  category: string; // 🔥 ADDED: Essential to match your updated backend entity!
}

interface InventoryActionPayload {
  itemId: number;
  quantityValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryManagementService {
  // 🔥 FIXED: Cleaned up the base URL and removed the weird 'privateHttp' naming
  private baseUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  /**
   * Downloads the complete live stock matrix currently available under this workspace tenant.
   */
  fetchAllStockBalances(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.baseUrl}/items/all`);
  }

  /**
   * Dispatches relative Stock Adjustments (e.g. tracking waste, damages, loss, or quick additions).
   */
  submitStockAdjustment(itemId: number, value: number): Observable<InventoryItem> {
    const payload: InventoryActionPayload = { itemId, quantityValue: value };
    return this.http.post<InventoryItem>(`${this.baseUrl}/adjust`, payload);
  }

  /**
   * Submits a definitive manual stocktake audit count to overwrite old balances.
   */
  submitInventoryCount(itemId: number, absoluteValue: number): Observable<InventoryItem> {
    const payload: InventoryActionPayload = { itemId, quantityValue: absoluteValue };
    return this.http.post<InventoryItem>(`${this.baseUrl}/count`, payload);
  }

  /**
   * Registers a brand-new raw ingredient item directly into the active tenant workspace.
   */
  createNewItem(item: Partial<InventoryItem>): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.baseUrl}/items/create`, item);
  }

  /**
   * Registers new bulk supplier purchase orders straight into live inventory counts.
   */
  submitReceivePurchaseOrder(itemId: number, addedValue: number): Observable<InventoryItem> {
    const payload: InventoryActionPayload = { itemId, quantityValue: addedValue };
    return this.http.post<InventoryItem>(`${this.baseUrl}/purchase-order/receive`, payload);
  }

  /**
   * Pulls shift summary data metrics to print the cashier shift close thermal report.
   */
  fetchShiftSummaryRecords(cashierId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/shift/summary/${cashierId}`);
  }

  /**
   * Registers a brand-new menu card product option straight into the active restaurant catalog database.
   */
  addMenuItemToCatalog(menuItemPayload: { itemName: string; price: number; category: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/menu-items/create`, menuItemPayload);
  }
}