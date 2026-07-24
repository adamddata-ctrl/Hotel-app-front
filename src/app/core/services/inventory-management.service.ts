import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Matches your folder hierarchy [image_EWtz6w.png]

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
  // FIX: Converted single quotes to true backticks (`) and pointed to your clean, simplified backend endpoint mapping [image_EWtz6w.png]
  private baseUrl = `${environment.apiUrl}/inventory`;

  constructor(private privateHttp: HttpClient) {} // Retained your privateHttp constructor configuration [image_EWtz6w.png]

  /**
   * Downloads the complete live stock matrix currently available under this workspace tenant.
   */
  fetchAllStockBalances(): Observable<InventoryItem[]> {
    // FIX: Converted single quotes to true backticks (`) to parse template variables flawlessly [image_13wORx.png]
    return this.privateHttp.get<InventoryItem[]>(`${this.baseUrl}/items/all`);
  }

  /**
   * Dispatches relative Stock Adjustments (e.g. tracking waste, damages, loss, or quick additions) [3.1].
   */
  submitStockAdjustment(itemId: number, value: number): Observable<InventoryItem> {
    const payload: InventoryActionPayload = { itemId, quantityValue: value };
    // FIX: Converted single quotes to true backticks (`) to clear terminal trace warnings [image_13wORx.png]
    return this.privateHttp.post<InventoryItem>(`${this.baseUrl}/adjust`, payload);
  }

  /**
   * Submits a definitive manual stocktake audit count to overwrite old balances [3.1].
   */
  submitInventoryCount(itemId: number, absoluteValue: number): Observable<InventoryItem> {
    const payload: InventoryActionPayload = { itemId, quantityValue: absoluteValue };
    // FIX: Converted single quotes to true backticks (`) to ensure clean endpoint transmission [image_13wORx.png]
    return this.privateHttp.post<InventoryItem>(`${this.baseUrl}/count`, payload);
  }

  /**
   * Registers a brand-new raw ingredient item directly into the active tenant workspace.
   */
  createNewItem(item: Partial<InventoryItem>): Observable<InventoryItem> {
    // FIX: Converted single quotes to true backticks (`) to support precise string data compilation [image_13wORx.png]
    return this.privateHttp.post<InventoryItem>(`${this.baseUrl}/items/create`, item);
  }

  /**
   * Registers new bulk supplier purchase orders straight into live inventory counts [3.1].
   */
  submitReceivePurchaseOrder(itemId: number, addedValue: number): Observable<InventoryItem> {
    const payload: InventoryActionPayload = { itemId, quantityValue: addedValue };
    // FIX: Converted single quotes to true backticks (`) to process network data exchanges end-to-end [image_13wORx.png]
    return this.privateHttp.post<InventoryItem>(`${this.baseUrl}/purchase-order/receive`, payload);
  }

  /**
   * Pulls shift summary data metrics to print the cashier shift close thermal report [image_8YxdKD.png].
   */
  fetchShiftSummaryRecords(cashierId: string): Observable<any> {
    // FIX: Converted single quotes to true backticks (`) and synchronized url paths exactly to your backend [image_8YxdKD.png]
    return this.privateHttp.get<any>(`${this.baseUrl}/shift/summary/${cashierId}`);
  }

  /**
   * Registers a brand-new menu card product option straight into the active restaurant catalog database.
   */
  addMenuItemToCatalog(menuItemPayload: { itemName: string; price: number; category: string }): Observable<any> {
    // FIX: Converted single quotes to true backticks (`) and pointed directly to your simplified backend menu endpoints [image_8YxdKD.png]
    return this.privateHttp.post<any>(`${environment.apiUrl}/menu-items/create`, menuItemPayload);
  }
}