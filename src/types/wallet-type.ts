interface WalletType{
  total_amount?: string;
  pending_amount?: string;
  withdrawable_amount?: string;
  total_balance?: string;
  pending_balance?: string;
  available_balance?: string;
  total_transactions?: string;
  tds_deductions?: string;
}

// Previous TransactionType was incomplete. Kept for backward compatibility where only id was used.
export interface TransactionType {
    id: number;
}

export interface TransactionItem {
  id: number;
  user_id: number;
  username: string;
  full_name: string;
  amount: string;
  type: 'credit' | 'debit' | string;
  category: string;
  source_user_id: number;
  remarks: string;
  status: string;
  created_at: string;
  total_amount?: string;
  commission_status?: string;
  commission_type?: string;
  generation_level?: number;
  source_user?: string;
  order_reference?: string;
}

export interface TransactionsResponse {
  success: boolean;
  data: TransactionItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'processing';


export interface CappingType {
  id: number;
  level_id: number;
  level_name: string;
  level_no: number;
  day_limit: string;
  week_limit: string;
  monthly_limit: string;
}

export interface WithdrawalRequest {
  id: number;
  userId: number;
  userName: string;
  email: string;
  phone: string;
  levelName: string;
  levelNo: number;
  uvAmount: number;
  rsAmount: number;
  bankName: string;
  accountNo: string;
  ifsc: string;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  balance?: number;
  dayUsed: number;
  weekUsed: number;
  monthUsed: number;
}
