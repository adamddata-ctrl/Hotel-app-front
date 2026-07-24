import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../../environments/environment';

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
  public menuItems: MenuItem[] = [];
  public errorMessage: string = '';
  public isLoading: boolean = false;

  // Local form tracking state binders
  public newItemName: string = '';
  public newItemCategory: 'FOOD' | 'DRINK' = 'FOOD';
  public newItemPrice: number | null = null;

  constructor(private http: HttpClient) {}

  public ngOnInit(): void {
    this.fetchCurrentMenu();
  }

  /**
   * Syncs the frontend view state with live multi-tenant backend catalog items.
   */
  public fetchCurrentMenu(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // FIX: Removed invalid single quotes and mapped directly to your real backend plural menu endpoints
    this.http.get<MenuItem[]>(`${environment.apiUrl}/menu-items`).subscribe({
      next: (data) => {
        this.menuItems = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to download active restaurant menu catalog.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Validates form inputs and dispatches the new payload to your Spring Boot REST backend.
   */
  public submitNewItem(): void {
    if (!this.newItemName.trim() || !this.newItemPrice || this.newItemPrice <= 0) {
      this.errorMessage = 'Please input a valid product name and positive unit price.';
      return;
    }

    const payload: MenuItem = {
      itemName: this.newItemName.trim(),
      category: this.newItemCategory,
      price: this.newItemPrice
    };

    this.isLoading = true;
    
    // FIX: Swapped out broken single-quote string literal blocks for clean, high-performance backticks
    this.http.post<MenuItem>(`${environment.apiUrl}/menu-items/create`, payload).subscribe({
      next: () => {
        this.fetchCurrentMenu(); // Re-trigger catalog synchronization loop to update layout rows instantly
        this.resetForm();
      },
      error: () => {
        this.errorMessage = 'Failed to register product details down onto the database repository.';
        this.isLoading = false;
      }
    });
  }

  public resetForm(): void {
    this.newItemName = '';
    this.newItemCategory = 'FOOD';
    this.newItemPrice = null;
    this.errorMessage = '';
  }

  /**
   * ADDED: Securely purges a specific menu item record from the active catalog rows [3.1].
   */
  public removeItemFromInventory(itemId: number): void {
    const confirmationGuard = confirm('⚠ ARE YOU SURE? This completely removes this item from the register system!');
    if (!confirmationGuard) return;

    // FIX: Standardized routing parameters to resolve structural microservice deletions safely
    this.http.delete(`${environment.apiUrl}/menu-items/delete/${itemId}`).subscribe({
      next: () => {
        // Instantly filter out the item row from the local view matrix state with zero page reloads [3.1]
        this.menuItems = this.menuItems.filter(item => item.id !== itemId);
        console.log(`INVENTORY ENGINE: Product Index #${itemId} successfully purged.`);
      },
      error: (err) => {
        console.error('INVENTORY ENGINE: Deletion pipeline request blocked.', err);
        alert('Failed to delete item. Make sure your Spring Boot backend controller is running.');
      }
    });
  }
}