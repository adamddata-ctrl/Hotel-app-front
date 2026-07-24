import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { InventoryManagementService } from '../../../core/services/inventory-management.service'; // Matches your folder structure [image_RkS4MM.png]
import { ReceiptPrinterService, PrintReceiptPayload } from '../../../core/services/receipt-printer.service'; // Matches your folder structure [image_RkS4MM.png]
import { environment } from '../../../../environments/environment'; // Matches your folder structure [image_RkS4MM.png]

interface MenuItem {
  id: number;
  itemName: string;
  category: 'FOOD' | 'DRINK';
  price: number; // Matches your exact field properties [image_RkS4MM.png]
}

interface CartItem {
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

@Component({
  selector: 'app-order-terminal',
  templateUrl: './order-terminal.component.html',
  styleUrls: ['./order-terminal.component.css']
})
export class OrderTerminalComponent implements OnInit {
  public menuItems: MenuItem[] = [];
  public filteredItems: MenuItem[] = [];
  public cart: CartItem[] = [];
  public today: Date = new Date();

  public activeCategory: 'ALL' | 'FOOD' | 'DRINK' = 'ALL';
  public selectedWaiterName: string = '';
  public cashierName: string = '';
  public errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private receiptPrinter: ReceiptPrinterService,
    private inventoryService: InventoryManagementService
  ) {}

  ngOnInit(): void {
    this.selectedWaiterName = localStorage.getItem('selected_waiter_name') || 'Unknown';
    this.cashierName = localStorage.getItem('cashier_name') || 'Cashier Desk';
    this.fetchMenuCatalog();
  }

  /**
   * THE CART FLUSH UTILITY: Clears uncommitted items currently held in local state memory.
   */
  clearUncommittedCart(): void {
    if (confirm('⚠ Are you sure you want to clear this running cart? This will wipe out all unprinted selections.')) {
      this.cart = [];
      console.log('🛒 TERMINAL ENGINE: Uncommitted active running ticket successfully flushed.');
    }
  }

  fetchMenuCatalog(): void {
    // FIX: Converted single quotes to true backticks (`) and pointed to your clean backend endpoint mapping
    this.http.get<MenuItem[]>(`${environment.apiUrl}/menu-items/active`)
      .subscribe({
        next: (data) => {
          this.menuItems = data;
          this.filterCatalog('ALL');
        },
        error: () => {
          this.errorMessage = 'Failed to load restaurant menu options.';
        }
      });
  }

  filterCatalog(category: 'ALL' | 'FOOD' | 'DRINK'): void {
    this.activeCategory = category;
    if (category === 'ALL') {
      this.filteredItems = this.menuItems;
    } else {
      this.filteredItems = this.menuItems.filter(item => item.category === category);
    }
  }

  /**
   * High-speed state tracking: Appends items or increments quantities with zero manual typing.
   */
  addToCart(item: MenuItem): void {
    const existingIndex = this.cart.findIndex(c => c.itemId === item.id);
    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += 1;
    } else {
      this.cart.push({
        itemId: item.id,
        itemName: item.itemName,
        quantity: 1,
        unitPrice: item.price // Maps item.price correctly to unitPrice [image_RkS4MM.png]
      });
    }
  }

  removeItemFromCart(item: CartItem): void {
    const existingIndex = this.cart.findIndex(c => c.itemId === item.itemId);
    if (existingIndex > -1) {
      if (this.cart[existingIndex].quantity > 1) {
        this.cart[existingIndex].quantity -= 1;
        console.log(`TERMINAL: Decremented quantity for item ID ${item.itemId}`);
      } else {
        this.cart.splice(existingIndex, 1);
        console.log(`TERMINAL: Flushed row item ID ${item.itemId} from uncommitted ticket`);
      }
    }
  }

  calculateTotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }

  /**
   * Executes database storage updates and fires the native printer loop stream instantly.
   */
  submitAndPrintTicket(): void {
    if (this.cart.length === 0) return;

    const formattedItems = this.cart.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    }));

    const cashierIdStr = localStorage.getItem('cashier_id') || '1';
    const waiterIdStr = localStorage.getItem('selected_waiter_id') || '0';

    const payload = {
      cashierId: cashierIdStr,
      waiterId: parseInt(waiterIdStr, 10),
      totalAmount: this.calculateTotal(),
      items: formattedItems
    };

    // FIX: Converted single quotes to true backticks (`) and dropped the legacy /api prefix segment to hit your checkout controller instantly
    this.http.post<any>(`${environment.apiUrl}/checkout/order`, payload)
      .subscribe({
        next: (response) => {
          try {
            const receiptPayload: PrintReceiptPayload = {
              orderId: response.orderId || Math.floor(Math.random() * 100000),
              waiterName: this.selectedWaiterName,
              tenantName: localStorage.getItem('active_tenant_name') || 'Hotel POS Client',
              items: this.cart.map(item => ({
                itemName: item.itemName,
                quantity: item.quantity,
                price: item.unitPrice
              }))
            };

            // Compile the string matrix down inside the service with 0% tax math additions
            const formattedSlipText = this.receiptPrinter.generateThermalSlipMarkup(receiptPayload);
            
            // Dispatch parameters straight out to pop windows spooler pipelines [3.1]
            this.receiptPrinter.dispatchToHardwareSpooler(formattedSlipText);

            alert('Order successfully concluded and printed!');
            
            // FIX: Merged your original final screenshot's cleanup and state tracking parameters [image_ZnsROT.png]
            this.cart = [];
            localStorage.removeItem('selected_waiter_id');
            localStorage.removeItem('selected_waiter_name');
            this.router.navigate(['/register/waiters']); // Redirect target synchronized [image_ZnsROT.png]

          } catch (printErr) {
            // FIX: Added your original printer module error logs [image_ZnsROT.png]
            console.error('PRINTER MODULE: Receipt spool mapping failed.', printErr);
            
            this.cart = [];
            localStorage.removeItem('selected_waiter_id');
            localStorage.removeItem('selected_waiter_name');
            this.router.navigate(['/register/waiters']); // Route backward safely to maintain workflow sequence [image_ZnsROT.png]
          }
        },
        error: (err) => {
          // FIX: Added your exact transaction failure messenger alerts [image_ZnsROT.png]
          console.error('TRANSACTION BLOCK FAILED:', err);
          this.errorMessage = 'Transaction submission failure. Order not routed.';
        }
      });
  }

  executeShiftCloseRoutine(): void {
    const activeCashierId = localStorage.getItem('cashier_id') || 'UNKNOWN_STAFF';
    const activeCashierName = localStorage.getItem('cashier_name') || 'Cashier Desk';

    if (!confirm('⚠ Are you sure you want to CLOSE SHIFT? This action compiles total drawer sales.')) {
      return;
    }

    // FIX: Swapped single quotes to true backticks (`) and aligned the endpoint to your unified /auth/cashier-logout controller mapping
    this.http.post<any>(`${environment.apiUrl}/auth/cashier-logout`, { cashierId: activeCashierId })
      .subscribe({
        next: (logoutLog: any) => {
          console.log('TIME CLOCK: Shift close logged.', logoutLog.message);
          
          // 2. Fetch financial report summary data records via your optimized inventory endpoints
          this.inventoryService.fetchShiftSummaryRecords(activeCashierId).subscribe({
            next: (data: any) => {
              let printPayload = `
========================================
       SHIFT CONCLUDED SUCCESSFULLY
========================================
\n\n\n
TERMINAL ID : LOCAL_STATION_01
CASHIER NAME: ${activeCashierName.toUpperCase()}
TIMESTAMP   : ${new Date().toLocaleString()}

TOTAL COMPLETED CHECKOUTS : ${data.totalCheckouts || 0}
GROSS SALES VOLUME        : $${(data.grossSalesVolume || 0).toFixed(2)}
CASH DRAWER INFLOW        : $${(data.cashInflow || 0).toFixed(2)}
CREDIT CARD TRANSFERS     : $${(data.cardInflow || 0).toFixed(2)}
----------------------------------------
              `;

              // Send complete text block to receipt hardware spooler line
              this.receiptPrinter.dispatchToHardwareSpooler(printPayload);

              // 3. Wipe current cashier cache states cleanly from browser cache
              localStorage.removeItem('selected_waiter_id');
              localStorage.removeItem('selected_waiter_name');
              
              alert(`Shift successfully concluded!\n${logoutLog.message}`);
              this.router.navigate(['/login']);
            },
            error: (err) => {
              console.error('SHIFT HUB: Financial records fetch failed.', err);
              this.router.navigate(['/login']);
            }
          });
        },
        error: (err: any) => {
          console.error('SHIFT HUB: Network logout timestamp check failed.', err);
          alert('Could not record clock-out event. Please check backend log errors.');
        }
      });
  }
}