import { Product, Variant } from './product';
import { Order } from './orders';

export interface NewCartItem {
  id: string;
  cart_id: string;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
  product_id: number;
  variation_id: null | string;
  product_name: string;
  slug: string;
  f_image: string;
  variant_details: null;
  is_variation_null: boolean;
}

export interface NewCartResponse {
  status: boolean;
  cart: {
    id: string;
    items: NewCartItem[];
    total_items: number;
    total: number;
  };
}

export interface BackendCartItem {
  id: number | string;
  product_id: number;
  product?: Partial<Product> & { name?: string; f_image?: string, tax_data?: { name?: string, percentage?: number } };
  variant_id?: number | string | null;
  variant_details?: any;
  product_name?: string;
  f_image?: string;
  is_variation_null?: boolean;
  variant?: Variant;
  quantity: number;
  price: number;
  subtotal: number;
  bv_point?: number; // MLM specific
  // Add more fields as per backend response
  product_name?: string; // Fallback for new API
  f_image?: string; // Fallback for new API
  is_variation_null?: boolean;
}

export interface CartResponse {
  success: boolean;
  data: BackendCartItem[];
  total_items: number;
  total_amount: number;
}

export interface AddToCartPayload {
  product_id: number;
  variation_id?: number | string;
  quantity?: number;
  price: number;
}
