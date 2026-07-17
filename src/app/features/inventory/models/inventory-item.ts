export interface InventoryItem {
  id?: number;
  name: string;
  quantityOnHand: number;
  minStockLevel: number;
  unitOfMeasure: string;
}