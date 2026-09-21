    export interface SalesSummary {
  total_orders: number;
  total_revenue: string;
  total_sub_total: string;
  total_tax: string;
  total_shipping: string;
  total_bv_points: number;
  avg_order_value: string;
}

export interface StatusBreakdown {
  order_status: string;
  count: number;
  revenue: string;
}

export interface PaymentStatusBreakdown {
  payment_status: string;
  payment_method:string;
  count: number;
  revenue: string;
}

export interface DailyTrend {
  date: string;
  orders: number;
  revenue: string;
  bv_points: number;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  total_qty_sold: number;
  total_orders: number;
  total_revenue: string;
}

export interface SalesReportData {
  summary: SalesSummary;
  status_breakdown: StatusBreakdown[];
  payment_status_breakdown: PaymentStatusBreakdown[];
  daily_trend: DailyTrend[];
  top_products: TopProduct[];
}

export interface SalesReportResponse {
  success: boolean;
  data: SalesReportData;
}

// ─── Profit & Loss Report Types ───

export interface OrderRevenue {
  total_order_revenue: string;
  total_sub_total: string;
  total_tax_collected: string;
  total_shipping_collected: string;
}

export interface PackageRevenue {
  total_package_revenue: string;
  total_package_sales: number;
}

export interface Income {
  order_revenue: OrderRevenue;
  package_revenue: PackageRevenue;
  total_income: string;
}

export interface Commissions {
  total_commissions: string;
  total_commission_transactions: number;
}

export interface Withdrawals {
  total_withdrawals: string;
  total_withdrawal_transactions: number;
}

export interface Refunds {
  total_refunds: string;
  total_refund_transactions: number;
}

export interface Expenses {
  commissions: Commissions;
  withdrawals: Withdrawals;
  refunds: Refunds;
  total_expense: string;
}

export interface ProfitLossSummary {
  total_income: string;
  total_expense: string;
  net_profit: string;
  profit_margin: string;
}

export interface MonthlyTrend {
  month: string;
  income: string;
  expense: string;
  net_profit: string;
}

export interface ProfitLossData {
  income: Income;
  expenses: Expenses;
  summary: ProfitLossSummary;
  monthly_trend: MonthlyTrend[];
}

export interface ProfitLossResponse {
  success: boolean;
  data: ProfitLossData;
  message?: string;
}

