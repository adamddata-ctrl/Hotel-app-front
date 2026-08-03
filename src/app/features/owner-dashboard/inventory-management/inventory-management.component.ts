import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // 🔥 ADDED: Needed to fetch the menu list!
import { environment } from '../../../../environments/environment'; // 🔥 ADDED: Needed for the API URL!
import { InventoryManagementService, InventoryItem } from '../../../core/services/inventory-management.service';

@Component({
  selector: 'app-inventory-management',
  templateUrl: './inventory-management.component.html',
  styleUrls: ['./inventory-management.component.css']
})
export class InventoryManagementComponent implements OnInit {
  public stockItems: InventoryItem[] = [];
  public menuItems: any[] = []; // 🔥 ADDED: To hold the list of burgers/drinks
  public errorMessage: string = '';
  public isLoading: boolean = false;

  // State modifiers for interactive workspace action blocks [3.1]
  public selectedItem: InventoryItem | null = null;
  public activeActionType: 'ADJUST' | 'COUNT' | 'RECEIVE' | null = null;
  public inputValueModifier: number | null = null;
  public transactionNotes: string = '';

  // Form state tracking parameters to create new supplies from the UI [3.1]
  public isCreateModalOpen: boolean = false;
  public newItemForm = {
    itemName: '',
    quantityOnHand: 0,
    minStockLevel: 0,
    unitOfMeasure: 'pcs',
    category: 'FOOD',
    menuItemId: null // 🔥 ADDED: To hold the selected menu item's ID
  };

  // 🔥 ADDED: Inject HttpClient to fetch the menu
  constructor(
    private inventoryService: InventoryManagementService,
    private http: HttpClient
  ) {}

  public ngOnInit(): void {
    this.refreshWarehouseMatrix();
    this.fetchMenuItemsForInventory(); // 🔥 ADDED: Fetch menu items on load
  }

  /**
   * Fetches the list of active menu items to populate the dropdown selector.
   */
  fetchMenuItemsForInventory(): void {
    this.http.get<any[]>(`${environment.apiUrl}/menu-items/active`).subscribe({
      next: (data) => {
        this.menuItems = data;
      },
      error: (err) => {
        console.error('Failed to load menu items for inventory linking.', err);
      }
    });
  }

  /**
   * Downloads live raw stocks currently associated with the active tenant workspace [3.1].
   */
  public refreshWarehouseMatrix(): void {
    this.isLoading = true;
    this.inventoryService.fetchAllStockBalances().subscribe({
      next: (data) => {
        this.stockItems = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('INVENTORY CONTROLLER: Service stream connection failed.', err);
        this.errorMessage = 'Failed to download asset records from server.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Spawns an overlay sheet block layout to prepare stock mutations [3.1]
   */
  public openAdjustmentModal(item: InventoryItem, type: 'ADJUST' | 'COUNT' | 'RECEIVE'): void {
    this.selectedItem = item;
    this.activeActionType = type;
    this.inputValueModifier = null;
    this.transactionNotes = '';
  }

  /**
   * Clears active modification state tracking parameters
   */
  public closeModal(): void {
    this.selectedItem = null;
    this.activeActionType = null;
    this.inputValueModifier = null;
    this.transactionNotes = '';
  }

  /**
   * Commits the finalized action value modifications over your network service [3.1]
   */
  public commitInventoryAction(): void {
    if (!this.selectedItem || this.inputValueModifier === null || this.inputValueModifier === undefined) {
      alert('Please fill out a valid quantitative adjustment number.');
      return;
    }

    const itemId = this.selectedItem.id;
    const value = this.inputValueModifier;

    this.isLoading = true;
    let requestStream$;

    // Direct transaction routing depending on workspace operation types [3.1]
    if (this.activeActionType === 'ADJUST') {
      requestStream$ = this.inventoryService.submitStockAdjustment(itemId, value);
    } else if (this.activeActionType === 'COUNT') {
      requestStream$ = this.inventoryService.submitInventoryCount(itemId, value);
    } else {
      requestStream$ = this.inventoryService.submitReceivePurchaseOrder(itemId, value);
    }

    requestStream$.subscribe({
      next: () => {
        this.refreshWarehouseMatrix(); // Auto-refresh data row models smoothly upon checkout completion loop [3.1]
        this.closeModal();
      },
      error: (err) => {
        console.error('INVENTORY CONTROLLER: Mutation pipe blocked.', err);
        alert('Failed to register inventory balance changes down to database tables.');
        this.isLoading = false;
      }
    });
  }

  /**
   * Toggle controls for opening the supplier asset window [3.1]
   */
  public openCreateModal(): void {
    this.isCreateModalOpen = true;
    // 🔥 FIXED: Include 'category' and 'menuItemId' when resetting the form
    this.newItemForm = { 
      itemName: '', 
      quantityOnHand: 0, 
      minStockLevel: 0, 
      unitOfMeasure: 'pcs',
      category: 'FOOD',
      menuItemId: null
    };
  }

  public closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  /**
   * Dispatches a post command to store the brand-new ingredient record [3.1]
   */
  public submitNewItem(): void {
    // FIX: Tightened the string validation loop to check for clean trimmed lengths explicitly to block blank row creations
    if (!this.newItemForm.itemName || this.newItemForm.itemName.trim().length === 0) {
      alert('Please enter a valid item description name.');
      return;
    }

    this.isLoading = true;
    this.inventoryService.createNewItem(this.newItemForm).subscribe({
      next: () => {
        this.refreshWarehouseMatrix(); // Instantly reload table dataset on safe return [3.1]
        this.closeCreateModal();
      },
      error: (err) => {
        console.error('INVENTORY HUB: New asset database save routine failed.', err);
        alert('Could not save item to backend repository schema.');
        this.isLoading = false;
      }
    });
  }
}