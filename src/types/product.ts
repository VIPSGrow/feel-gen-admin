export interface Category {
  id: number;
  name: string;
  slug?: string;
  parent_id: number | null;
}

export interface Tax {
  id: number;
  tax_name: string;
  tax_percentage:string;
}

export interface AttributeValue {
  id: string;
  attr_id: string;
  value: string;
}

export interface Variant {
  id?: string;
  sku: string;
  price: string;
  bv_point: number;
  stock: number;
  image?: string | File | null;
  attr_mappings: Array<{ attr_id: string; value_id: string }>;
}

export interface Product {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  base_price: string;
  discounted_price?: number;
  cat_id: string;
  category?: Category;
  category_name? :string;
  subcategories?: string[];
  attributes?: string[];
  variants: Variant[];
  variant_count:number;
  f_image: string;
  g_image: string[];
  status: 'active' | 'inactive' | 'trash';
  tax_id: string;
  tax?: Tax;

  hsn_code?: string;
  weight?: string | number;
  dimension_length?: string | number;
  dimension_width?: string | number;
  dimension_height?: string | number;
  dimension_unit?: string;

  created_at: string;
  updated_at?: string;
  tax_data?:{
    name?:string,
    percentage?:number,
    id?:number
  } | null

  mrp_percentage?: number;
  dpc_percentage?: number;
  mrp_price?: number;
  dpc_price?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T[];
  message?: string;
}
