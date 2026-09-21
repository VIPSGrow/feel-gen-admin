export interface InventoryProduct {
  id: number;
  name: string;
  slug: string;
  f_image: string;
  base_price: number;
}

export interface AttrCombination {
  value: string;
  attr_id: number;
  attr_value_id: number;
}

export interface InventoryVariant {
  id: number;
  sku: string;
  price: number;
  bv_point: number;
  attr_combinations: AttrCombination[];
}

export interface InventoryItem {
  id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  product: InventoryProduct;
  variant: InventoryVariant | null;
}

export interface InventoryPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface InventoryResponse {
  success: boolean;
  id?: number;
  data?: InventoryItem[];
  pagination?: InventoryPagination;
  message?: string;
}

