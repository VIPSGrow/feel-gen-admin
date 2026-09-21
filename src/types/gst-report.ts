export interface GSTSummary {
  total_orders: number;
  total_taxable_value: string;
  total_gst_collected: string;
  total_amount: string;
  avg_gst_per_order: string;
}

export interface TaxSlab {
  tax_rate: string;
  total_orders: number;
  taxable_value: string;
  gst_amount: string;
}

export interface GSTMonthlyTrend {
  month: string;
  orders: number;
  taxable_value: string;
  gst_collected: string;
}

export interface GSTTopOrder {
  order_id: number;
  order_number: string;
  customer_name: string;
  taxable_value: string;
  gst_amount: string;
  total_amount: string;
  order_date: string;
}

export interface GSTByProduct {
  product_id: number;
  product_name: string;
  total_orders: number;
  total_qty_sold: number;
  taxable_value: string;
  gst_amount: string;
}

export interface B2BB2CBreakdown {
  type: string;
  total_orders: number;
  taxable_value: string;
  gst_amount: string;
}

export interface GSTSplit {
  total_gst: string;
  cgst: string;
  sgst: string;
  igst: string;
}

export interface GSTReportData {
  summary: GSTSummary;
  tax_slabs: TaxSlab[];
  monthly_trend: GSTMonthlyTrend[];
  top_orders: GSTTopOrder[];
  by_product: GSTByProduct[];
  b2b_b2c_breakdown: B2BB2CBreakdown[];
  gst_split: GSTSplit;
}

export interface GSTReportResponse {
  success: boolean;
  data: GSTReportData;
  message?: string;
}

