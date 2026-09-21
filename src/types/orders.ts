
export interface OrderItem {
  product_id: number;
  variant_id: number;
  product_name: string;
  product_image: string;
  variant_sku: string;
  variant_details: {
    price: number;
    bv_point: number;
    attributes: Array<{
      attr_id: number;
      attr_value_id: number;
      value: string;
    }>;
  };
  qty: number;
  unit_price: number;
  unit_bv_points: number;
  total_item_price: number;
  total_item_bv: number;
}

export interface Order {
  id: number;
  order_id: string;
  distributor_id: number;
  sub_total: number;
  tax_amount: number;
  shipping_charges: number;
  total_amount: number;
  total_bv_points: number;
  payment_method: string;
  shipping_address: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  order_status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: string;
  created_at: string;
  updated_at?: string;
  user_type:string;
  user_name:string;
  order_for:string;
  items: OrderItem[];
  products:OrderItem[];
  distributor:{
    phone:string;
    name:string;
  };
  user_phone:string;
}

export interface OrdersApiResponse {
  success: boolean;
  data: Order[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface OrdersApiResponse {
  status?: boolean;
  data: Order[];
  total?: number;
  page?: number;
  limit?: number;
}






