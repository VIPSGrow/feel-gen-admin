import { ApiResponse } from './product';
import { User } from '../lib/auth';

export interface PurchasePackage {
  id: number;
  name: string;
  tag:string;
  description: string;
  price: number;
  bv_points: number;
  stock: number;
  status: 'active' | 'out-of-stock' | 'inactive';
  image?: string;
  is_trial: boolean;
  min_order_qty?: number;
}

export interface Purchase {
  id: number;
  package_id: number;
  user_id: number;
  quantity: number;
  total_amount: number;
  bv_total: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export type PurchaseApiResponse = ApiResponse<PurchasePackage[]>;

// Razorpay types
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: 'created' | 'paid' | 'failed';
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export type RazorpayOrderResponse = ApiResponse<RazorpayOrder>;

export type RazorpayVerifyResponse = ApiResponse<{orderId: string}>;

// CheckoutForm props
export interface CheckoutFormProps {
  selectedPackage: PurchasePackage;
  user: User;
  amount: number;
  onSuccess: () => void;
}

export const MOCK_PACKAGES: PurchasePackage[] = [
  {
    id: 1,
    name: "Level 1: Basic Sakhi ",
    tag:"(Initial start)",
    description: "Minimum order ₹2,000. No KYC ",
    price: 2000,
    bv_points: 3000,
    stock: 999,
    status: "active" as const,
    image: "./plan/plan1.png",
    is_trial: true,
    min_order_qty: 1
  },
  {
    id: 2,
    name: "Level 2: Professional Sakhi ",
    tag:"(Small business stock)",
    description: "₹25,000. KYC – REQUIRED. Commission - block.",
    price: 25000,
    bv_points: 37500,
    stock: 999,
    status: "active" as const,
    image: "./plan/plan2.png",
    is_trial: false,
    min_order_qty: 1
  },
  {
    id: 3,
    name: "Level 3: Master Sakhi / Distributor ",
    tag:"(Large-scale/Stockist)",
    description: "₹1,00,000. KYC - REQUIRED. Commission - Active.",
    price: 100000,
    bv_points: 150000,
    stock: 999,
    status: "active" as const,
    image: "./plan/plan3.png",
    is_trial: false,
    min_order_qty: 1
  }
];
