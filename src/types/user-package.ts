export interface PackageDetails {
  id: number;
  name: string;
  level: number;
  price: string; // Stored as string in JSON for precision
  description: string;
  kyc_required: boolean;
  commission_status: 'active' | 'inactive';
  created_at: string; // ISO Date string
  image: string | null;
}

export interface UserData{
  username:string;
  full_name:string;
  email:string;
  phone:string
}

export interface PurchaseRecord {
  id: number;
  user_id: number;
  package_id: number;
  package_details: PackageDetails;
  user_data:UserData;
  amount: string; // Matches the decimal string format from the DB
  status: 'pending' | 'activated' | 'failed' | 'cancelled';
  payment_method: 'wallet' | 'razorpay' | 'bank_transfer';
  transaction_id: string | null;
  purchased_at: string;
  activated_at: string | null;
}