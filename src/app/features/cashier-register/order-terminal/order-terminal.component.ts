import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


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
  
  activeCategory: 'ALL' | 'FOOD' | 'DRINK' = 'ALL';
  selectedWaiterName: string = '';
  cashierName: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

   /**
   * Initializes session variables and pulls product catalogs on mount
   */
  ngOnInit(): void {
    this.selectedWaiterName = localStorage.getItem('selected_waiter_name') || 'Unknown';
    this.cashierName = localStorage.getItem('cashier_name') || 'Cashier Desk';
    this.fetchMenuCatalog();
  }

  fetchMenuCatalog(): void {
    this.http.get<MenuItem[]>('http://localhost:8080/api/menu/all')
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

  /**
   * Switches grid matrices based on food or drink categorization filters
   */
  filterCatalog(category: 'ALL' | 'FOOD' | 'DRINK'): void {
    this.activeCategory = category;
    if (category === 'ALL') {
      this.filteredItems = this.menuItems;
    } else {
      this.filteredItems = this.menuItems.filter(item => item.category === category);
    }
  }
   /**
   * High-speed state tracking: Appends items or increments quantities with zero manual typing
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
  calculateTotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }

  /**
   * Executes database storage updates and fires the native printer loop stream instantly
   */
  submitAndPrintTicket(): void {
    if (this.cart.length === 0) return;

    const payload = {
      cashierId: localStorage.getItem('cashier_id'),
      waiterId: parseInt(localStorage.getItem('selected_waiter_id') || '0'),
      totalAmount: this.calculateTotal(),
      items: this.cart
    };

      this.http.post('http://localhost:8080/api/checkout/order', payload)
      .subscribe({
        next: () => {
          // Trigger browser local styling driver-free print layout stream sequence
          window.print();
          
          // Clear operational parameters and route backward to start a clean new cycle
          this.cart = [];
          localStorage.removeItem('selected_waiter_id');
          localStorage.removeItem('selected_waiter_name');
          this.router.navigate(['/register/waiters']);
        },
        error: () => {
          this.errorMessage = 'Transaction submission failure. Order not routed.';
        }
      });
  }
}