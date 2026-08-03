import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { InventoryManagementService, InventoryItem } from '../../../core/services/inventory-management.service';

@Component({
  selector: 'app-inventory-management',
  templateUrl: './inventory-management.component.html',
  styleUrls: ['./inventory-management.component.css']
})
export class InventoryManagementComponent implements OnInit {
  public stockItems: InventoryItem[] = [];
  public menuItems: any[] = []; 
  public errorMessage: string = '';
  public isLoading: boolean = false;

  public selectedItem: InventoryItem | null = null;
  public activeActionType: 'ADJUST' | 'COUNT' | 'RECEIVE' | null = null;
  public inputValueModifier: number | null = null;
  public transactionNotes: string = '';

  public isCreateModalOpen: boolean = false;
  
  public newItemForm = {
    itemName: '',
    quantityOnHand: 0,
    minStockLevel: 0,
    unitOfMeasure: 'pcs',
    category: 'FOOD',
    linkedMenuIds: [] as number[] 
  };

  // 🔥 CRITICAL SETTINGS: The dropdown library needs this to map the IDs and Names!
  public dropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'itemName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  constructor(
    private inventoryService: InventoryManagementService,
    private http: HttpClient
  ) {}

  public ngOnInit(): void {
    this.refreshWarehouseMatrix();
    this.fetchMenuItemsForInventory();
  }

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

  public openAdjustmentModal(item: InventoryItem, type: 'ADJUST' | 'COUNT' | 'RECEIVE'): void {
    this.selectedItem = item;
    this.activeActionType = type;
    this.inputValueModifier = null;
    this.transactionNotes = '';
  }

  public closeModal(): void {
    this.selectedItem = null;
    this.activeActionType = null;
    this.inputValueModifier = null;
    this.transactionNotes = '';
  }

  public commitInventoryAction(): void {
    if (!this.selectedItem || this.inputValueModifier === null || this.inputValueModifier === undefined) {
      alert('Please fill out a valid quantitative adjustment number.');
      return;
    }

    const itemId = this.selectedItem.id!;
    const value = this.inputValueModifier;

    this.isLoading = true;
    let requestStream$;

    if (this.activeActionType === 'ADJUST') {
      requestStream$ = this.inventoryService.submitStockAdjustment(itemId, value);
    } else if (this.activeActionType === 'COUNT') {
      requestStream$ = this.inventoryService.submitInventoryCount(itemId, value);
    } else {
      requestStream$ = this.inventoryService.submitReceivePurchaseOrder(itemId, value);
    }

    requestStream$.subscribe({
      next: () => {
        this.refreshWarehouseMatrix();
        this.closeModal();
      },
      error: (err) => {
        console.error('INVENTORY CONTROLLER: Mutation pipe blocked.', err);
        alert('Failed to register inventory balance changes down to database tables.');
        this.isLoading = false;
      }
    });
  }

  public openCreateModal(): void {
    this.isCreateModalOpen = true;
    this.newItemForm = { 
      itemName: '', 
      quantityOnHand: 0, 
      minStockLevel: 0, 
      unitOfMeasure: 'pcs',
      category: 'FOOD',
      linkedMenuIds: [] 
    };
  }

  public closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  public submitNewItem(): void {
    if (!this.newItemForm.itemName || this.newItemForm.itemName.trim().length === 0) {
      alert('Please enter a valid item description name.');
      return;
    }

    this.isLoading = true;
    this.inventoryService.createNewItem(this.newItemForm).subscribe({
      next: () => {
        this.refreshWarehouseMatrix();
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