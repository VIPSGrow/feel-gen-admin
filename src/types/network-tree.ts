export interface TreeUser {
  id: number;
  username: string;
  email: string;
  phone: string;
  full_name:string;
  node_path: string;
  referrer_id: number;
  referrer:ReferrerUser;
  referral_code: string;
  kyc_status:boolean;
  level_name: string;
  team_size: number;
  created_at: string;
  children: TreeUser[];
  is_active: boolean;
  package_status?: string;
  order_status?: string;
  commission_earned?: string | number;
  total_commission?: string | number;
}

export interface ReferrerUser{
  full_name:string;
  phone:string;
}

export interface ApiTreeResponse {
  status: boolean;
  data: TreeUser[];
}

