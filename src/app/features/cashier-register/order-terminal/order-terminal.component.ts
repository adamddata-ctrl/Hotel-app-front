import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InventoryManagementService } from '../../../core/services/inventory-management.service';
import { Router } from '@angular/router';
import { ReceiptPrinterService, PrintReceiptPayload } from '../../../core/services/receipt-printer.service'; // 🔥 FIXED: Imports your custom service path cleanly
import { environment } from '../../../../environments/environment';

interface MenuItem {
  id: number;
  itemName: string;
  category: 'FOOD' | 'DRINK';
  price: number;
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
  menuItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  cart: CartItem[] = [];
  today: Date = new Date();

  activeCategory: 'ALL' | 'FOOD' | 'DRINK' = 'ALL';
  selectedWaiterName: string = '';
  cashierName: string = '';
   errorMessage: string = '';

  // 🔥 FIXED: Injected ReceiptPrinterService cleanly alongside your other constructor drivers
  constructor(
    private http: HttpClient,
    private router: Router,
    private receiptPrinter: ReceiptPrinterService ,
     private inventoryService: InventoryManagementService 
  ) {}

  /**
   * Initializes session variables and pulls product catalogs on mount
   */
  ngOnInit(): void {
    this.selectedWaiterName = localStorage.getItem('selected_waiter_name') || 'Unknown';
    this.cashierName = localStorage.getItem('cashier_name') || 'Cashier Desk';
    this.fetchMenuCatalog();
  }
   /**
   * THE CART FLUSH UTILITY: Clears uncommitted items currently held in local state memory.
   */
  clearUncommittedCart(): void {
    if (confirm('⚠️ Are you sure you want to clear this running cart? This will wipe out all unprinted selections.')) {
      this.cart = []; // Flushes the array tracking workspace instantly, clearing your touchscreen layout view!
      console.log('🛒 TERMINAL ENGINE: Uncommitted active running ticket successfully flushed.');
    }
  }

  fetchMenuCatalog(): void {
    this.http.get<MenuItem[]>(`${environment.apiUrl}/api/menu/all`)
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
   * 🔥 ADDED: Compiles, displays, and dispatches an official hardcopy print summary [3.1].
   */
  
/**
   * 🏁 AUTOMATED SHIFT-CLOSING METRIC COMPILER
   * Communicates with your AuthController to register shift duration logs in MySQL [3.1].
   */
  executeShiftCloseoutRoutine(): void {
    const activeCashierId = localStorage.getItem('cashier_id') || 'UNKNOWN_STAFF';
    const activeCashierName = localStorage.getItem('cashier_name') || 'Cashier Desk';

    if (!confirm('⚠️ Are you sure you want to CLOSE SHIFT? This action compiles total drawer sales.')) {
      return;
    }

    // 1. First, tell the backend to stamp the Clock-Out timestamp and compute hours worked [3.1]
   this.http.post<any>(`${environment.apiUrl}/api/auth/cashier-logout`, { cashierId: activeCashierId })
      .subscribe({
        next: (logoutLog: any) => {
          console.log('🛡️ TIME CLOCK: Shift close logged.', logoutLog.message);
          // 2. Fetch financial report summary data records [3.1]
          this.inventoryService.fetchShiftSummaryRecords(activeCashierId).subscribe({
            next: (data) => {
              let printPayload = `
========================================
       SHIFT CLOSEOUT AUDIT REPORT      
========================================
TERMINAL ID : LOCAL_STATION_01
CASHIER NAME: ${activeCashierName.toUpperCase()}
TIMESTAMP   : ${new Date().toLocaleString()}
----------------------------------------
TOTAL COMPLETED CHECKOUTS : ${data.totalCheckouts}
GROSS SALES VOLUME        : $${data.grossSalesVolume.toFixed(2)}
----------------------------------------
CASH DRAWER INFLOW        : $${data.cashInflow.toFixed(2)}
CREDIT CARD TRANSFERS     : $${data.cardInflow.toFixed(2)}

========================================
       SHIFT CONCLUDED SUCCESSFULLY     
========================================
\n\n\n`;

              // Send to receipt hardware spooler
              this.receiptPrinter.dispatchToHardwareSpooler(printPayload);

              // 3. Wipe current cashier cache states cleanly from browser cache [3.1]
              localStorage.removeItem('cashier_id');
              localStorage.removeItem('cashier_name');
              alert(`Shift successfully concluded!\n${logoutLog.message}`);
              this.router.navigate(['/login']);
            },
            error: (err) => {
              console.error('SHIFT HUB: Financial records fetch failed.', err);
            }
          });
           },
       error: (err: any) => {
          console.error('SHIFT HUB: Network logout timestamp check failed.', err);
          alert('Could not record clock-out event. Please check backend log errors.');
        }
      });
  }


  /**
   *  * High-speed state tracking: Appends items or increments quantities with zero manual typing
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
        unitPrice: item.price
      });
    }
  }

  removeItemFromCart(item: CartItem): void {
    const existingIndex = this.cart.findIndex(c => c.itemId === item.itemId);

    if (existingIndex > -1) {
      if (this.cart[existingIndex].quantity > 1) {
        // Option A: Decrement count by exactly 1 item row safely
        this.cart[existingIndex].quantity -= 1;
        console.log(`TERMINAL: Decremented quantity for item ID ${item.itemId}`);
      } else {
        // Option B: Completely strip the item out of the active running array template list
        this.cart.splice(existingIndex, 1);
        console.log(`TERMINAL: Flushed row item ID ${item.itemId} from uncommitted ticket`);
      }
    }
  }

  calculateTotal(): number {  
     return this.cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }

  /**
   * Executes database storage updates and fires the native printer loop stream instantly
   */
  submitAndPrintTicket(): void {
    if (this.cart.length === 0) return;

    // Fixed: Map the frontend cart layout items array cleanly to match the Spring Boot DTO properties exactly
    const formattedItems = this.cart.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    }));

    const payload = { 
        cashierId: localStorage.getItem('cashier_id'),
      waiterId: parseInt(localStorage.getItem('selected_waiter_id') || '0'),
      totalAmount: this.calculateTotal(),
      items: formattedItems
    };

    this.http.post<any>(`${environment.apiUrl}/api/checkout/order`, payload)
      .subscribe({
        next: (response) => {
          // ==========================================================================
          // 🖨️ 🔥 TAX-FREE THERMAL RECEIPT HARDCOPY PRINTER STREAM PIPELINE
          // ==========================================================================
          try {
            const receiptPayload: PrintReceiptPayload = {
              orderId: response?.orderId || Math.floor(Math.random() * 100000), // Falls back cleanly to random index if missing
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
          } catch (printErr) {
            console.error('🖨️ PRINTER MODULE: Receipt spool mapping failed.', printErr);
          }

           // Clear operational parameters and route backward to start a clean new cycle
          this.cart = [];
          localStorage.removeItem('selected_waiter_id');
          localStorage.removeItem('selected_waiter_name');
          this.router.navigate(['/register/waiters']);
        },
        error: (err) => {
          this.errorMessage = 'Transaction submission failure. Order not routed.';
          throw err;
        }
      });
  }
}