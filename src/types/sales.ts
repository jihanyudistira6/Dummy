export type OrderStatus = 'Selesai' | 'Dikirim' | 'Retur';

export interface SaleOrder {
  id: string; // e.g. "ORD-1001"
  date: string; // e.g. "2026-01-02"
  region: string; // e.g. "Jawa", "Sumatera", etc.
  salesRep: string; // e.g. "Budi", "Siti", etc.
  category: string; // e.g. "Elektronik", "Fashion", "Perabot"
  productName: string;
  quantity: number;
  unitPrice: number;
  totalRevenue: number;
  status: OrderStatus;
}

export type SortDimension = 'product' | 'category' | 'region' | 'salesRep';

export interface FilterState {
  region: string; // 'ALL' or specific region
  category: string; // 'ALL' or specific category
  status: string; // 'ALL' or specific status
  searchQuery: string;
  sortByRevenueDesc: boolean;
  dimension: SortDimension;
}

export interface DimensionRevenueItem {
  key: string;
  label: string;
  revenue: number;
  quantity: number;
  orderCount: number;
  percentage: number;
  category?: string;
  region?: string;
}
