export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  brand: string;
  uom: string;
  selling_price: number;
  cost_price: number;
  reorder_level: number;
  safety_stock: number;
  on_hand: number;
  reserved: number;
  available: number;
}