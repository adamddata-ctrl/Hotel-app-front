import { Component, OnInit } from '@angular/core';
import { InventoryManagementService, InventoryItem } from '../../../core/services/inventory-management.service'; // Adjust path directories to match folder structure

@Component({
  selector: 'app-inventory-management',
  templateUrl: './inventory-management.component.html',
  styleUrls: ['./inventory-management.component.css']
})
export class InventoryManagementComponent implements OnInit {
  stockItems: InventoryItem[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;

  // State modifiers for interactive workspace action blocks [3.1]
  selectedItem: InventoryItem | null = null;
  activeActionType: 'ADJUST' | 'COUNT' | 'RECEIVE' | null = null;
  inputValueModifier: number | null = null;
  transactionNotes: string = '';
  // 🔥 ADDED: Form state tracking parameters to create new supplies from the UI [3.1]
  isCreateModalOpen: boolean = false;
  newItemForm = {
    itemName: '',
    quantityOnHand: 0,
    minStockLevel: 0,
    unitOfMeasure: 'pcs'
  };

  constructor(private inventoryService: InventoryManagementService) { }

  ngOnInit(): void {
    this.refreshWarehouseMatrix();
  }

  /**
   * Downloads live raw stocks currently associated with the active tenant workspace [3.1].
   */
  refreshWarehouseMatrix(): void {
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
  openAdjustmentModal(item: InventoryItem, type: 'ADJUST' | 'COUNT' | 'RECEIVE'): void {
    this.selectedItem = item;
    this.activeActionType = type;
    this.inputValueModifier = null;
    this.transactionNotes = '';
  }

  closeModal(): void {
    this.selectedItem = null;
    this.activeActionType = null;
  }

   /**
   * Commits the finalized action value modifications over your network service [3.1]
   */
  commitInventoryAction(): void {
    if (!this.selectedItem || this.inputValueModifier === null || this.inputValueModifier === undefined) {
      alert('Please fill out a valid quantitative adjustment number.');
      return;
    }

    const itemId = this.selectedItem.id;
    const value = this.inputValueModifier;

    this.isLoading = true;

    // Direct transaction routing depending on workspace operation types [3.1]
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

  // 🔥 ADDED: Form toggle controls for opening and closing the supplier asset window [3.1]
  openCreateModal(): void {
    this.isCreateModalOpen = true;
    this.newItemForm = { itemName: '', quantityOnHand: 0, minStockLevel: 0, unitOfMeasure: 'pcs' };
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  

  /**
   * 🔥 ADDED: Dispatches a post command to store the brand-new ingredient record [3.1]
   */
  submitNewItem(): void { 
     if (!this.newItemForm.itemName.trim()) {
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