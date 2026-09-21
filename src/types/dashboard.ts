export interface DashboardUser {
  id: number;
  full_name: string;
  username: string;
  phone: string;
  email: string;
  referral_code: string;
  is_active: boolean;
  kyc_status: boolean;
  created_at: string;
}

export interface DashboardOrder {
  id: number;
  order_id: string;
  total_amount: string;
  order_status: string;
  payment_status: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
}

export interface DashboardTransaction {
  id: number;
  amount: string;
  type: string;
  category: string;
  status: string;
  created_at: string;
  user_name: string;
  user_phone: string;
}

export interface DashboardUsers {
  total_users: number;
  active_users: number;
  inactive_users: number;
  kyc_approved_users: number;
  kyc_pending_users: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
}

export interface DashboardOrders {
  total_orders: number;
  total_revenue: string;
  avg_order_value: string;
  pending_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  paid_orders: number;
  unpaid_orders: number;
}

export interface DashboardPackages {
  total_package_purchases: number;
  total_package_revenue: string;
}

export interface DashboardKyc {
  pending_kyc: number;
  under_review_kyc: number;
  approved_kyc: number;
  rejected_kyc: number;
}

export interface DashboardWallet {
  total_wallet_balance: string;
  total_pending_amount: string;
}

export interface DashboardTransactions {
  total_commissions: string;
  total_withdrawals: string;
  total_purchases: string;
  total_ref_bonuses: string;
}

export interface DashboardProducts {
  total_products: number;
  total_variants: number;
  low_stock_variants: number;
}

export interface DashboardNotifications {
  total_notifications: number;
}

export interface DashboardRecent {
  orders: DashboardOrder[];
  users: DashboardUser[];
  transactions: DashboardTransaction[];
}

export interface DailySale {
  date: string;
  orders: number;
  revenue: string;
}

export interface DailyRegistration {
  date: string;
  new_users: number;
}

export interface DailyPackage {
  date?: string;
  purchases?: number;
  revenue?: string;
}

export interface DashboardCharts {
  daily_sales: DailySale[];
  daily_registrations: DailyRegistration[];
  daily_packages: DailyPackage[];
}

export interface DashboardData {
  users: DashboardUsers;
  orders: DashboardOrders;
  packages: DashboardPackages;
  kyc: DashboardKyc;
  wallet: DashboardWallet;
  transactions: DashboardTransactions;
  products: DashboardProducts;
  notifications: DashboardNotifications;
  recent: DashboardRecent;
  charts: DashboardCharts;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  errors: string[];
  message: string;
}

// ====== DISTRIBUTOR DASHBOARD TYPES ======

export interface DistributorProfile {
  id: number;
  full_name: string;
  username: string;
  phone: string;
  email: string;
  referral_code: string;
  binary_path: string;
  level: number;
  is_active: boolean;
  kyc_status: boolean;
  created_at: string;
}

export interface DistributorWallet {
  total_amount?: string;
  pending_amount?: string;
  withdrawable_amount?: string;
  tds_deductions?: string;
  completed_amount?: string;
  total_balance?: string;
  pending_balance?: string;
  available_balance?: string;
}

export interface DistributorOrders {
  total_orders: number;
  total_spent: string;
  avg_order_value: string;
  pending_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  paid_orders: number;
  unpaid_orders: number;
}

export interface DistributorTransaction {
  id: number;
  amount: string;
  type: string;
  category: string;
  status: string;
  remarks: string;
  created_at: string;
  total_amount?: string;
  generation_level?: number;
  source_user?: string;
  order_reference?: string;
}

export interface DistributorTransactions {
  total_commissions: string;
  total_withdrawals: string;
  total_purchases: string;
  total_ref_bonuses: string;
  total_credits: number;
  total_debits: number;
  direct_partner_commission?: string;
  generation_commissions?: Record<string, string | number>;
  pending_commission?: string;
  completed_commission?: string;
  withdrawable_amount?: string;
  tds_deductions?: string;
}

export interface DistributorTeam {
  total_team_members: number;
  direct_referrals: number;
  downline_members: number;
}

export interface DistributorRecentOrder {
  id: number;
  order_id: string;
  total_amount: string;
  order_status: string;
  payment_status: string;
  created_at: string;
}

export interface DailyOrder {
  date: string;
  orders: number;
  spending: string;
}

export interface DailyTransaction {
  date: string;
  credits: string;
  debits: string;
}

export interface DistributorRecent {
  orders: DistributorRecentOrder[];
  transactions: DistributorTransaction[];
}

export interface DistributorCharts {
  daily_orders: DailyOrder[];
  daily_transactions: DailyTransaction[];
}

export interface DistributorDashboardData {
  profile: DistributorProfile;
  wallet: DistributorWallet;
  orders: DistributorOrders;
  transactions: DistributorTransactions;
  team: DistributorTeam;
  recent: DistributorRecent;
  charts: DistributorCharts;
}

export interface DistributorDashboardResponse {
  success: boolean;
  data: DistributorDashboardData;
  errors: string[];
  message: string;
}

