import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface MenuItem {
  id?: number;
  itemName: string;
  category: 'FOOD' | 'DRINK';
  price: number;
}

@Component({
  selector: 'app-menu-management',
  templateUrl: './menu-management.component.html',
  styleUrls: ['./menu-management.component.css']
})
export class MenuManagementComponent implements OnInit {
  menuItems: MenuItem[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;

  // Local form tracking state binders
  newItemName: string = '';
  newItemCategory: 'FOOD' | 'DRINK' = 'FOOD';
  newItemPrice: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchCurrentMenu();
  }

  /**
   * Downloads the active catalog.
   * Note: Your TenantInterceptor automatically handles attaching the required X-Tenant-ID header!
   */
  fetchCurrentMenu(): void {
    this.isLoading = true;
    this.http.get<MenuItem[]>('http://localhost:8080/api/menu/all')
      .subscribe({
        next: (data) => {
          this.menuItems = data;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to download active inventory data.';
          this.isLoading = false;
        }
      });
  }
  /**
   * Validates input values and dispatches the new payload to your Spring Boot REST backend
   */
  submitNewItem(): void {
    if (!this.newItemName || !this.newItemPrice || this.newItemPrice <= 0) {
      this.errorMessage = 'Please input a valid product name and positive unit price.';
      return;
    }

    const payload: MenuItem = {
      itemName: this.newItemName,
      category: this.newItemCategory,
      price: this.newItemPrice
    };

    this.http.post('http://localhost:8080/api/menu/add', payload)
      .subscribe({
        next: () => {
           this.fetchCurrentMenu(); // Re-trigger catalog synchronization loop to update the layout rows instantly
          this.resetForm();
        },
        error: () => {
          this.errorMessage = 'Failed to register product details down onto the database repository.';
        }
      });
  }

  resetForm(): void {
    this.newItemName = '';
    this.newItemCategory = 'FOOD';
    this.newItemPrice = null;
    this.errorMessage = '';
  }

  /**
   *  * 🔥 ADDED: Securely purges a specific menu item record from the active catalog rows [3.1].
   * Fully insulated inside the owner-dashboard module view container.
   */
  removeItemFromInventory(itemId: number): void {
    const confirmationGuard = confirm('⚠️ ARE YOU SURE? This completely removes this item from the register system!');
    if (!confirmationGuard) return;

    this.http.delete(`http://localhost:8080/api/menu/delete/${itemId}`).subscribe({
      next: () => {
        // Instantly filter out the item row from the local view matrix state with zero page reloads [3.1]
        this.menuItems = this.menuItems.filter(item => item.id !== itemId);
        console.log(`📦 INVENTORY ENGINE: Product Index #${itemId} successfully purged.`);
      },
      error: (err) => {
        console.error('INVENTORY ENGINE: Deletion pipeline request blocked.', err);
        alert('Failed to delete item. Make sure your Spring Boot backend controller is running.');
      }
    });
  }
}