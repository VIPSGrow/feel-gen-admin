export interface Address {
  id: string;
  user_id: string | null;
  distributor_id?: number;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  landmark: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressPayload {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country?: string;
  pincode: string;
  landmark?: string;

  // Used by checkout address modal
  is_default?: boolean;

  // Used by checkout modal state select
  stateId?: number;
}


