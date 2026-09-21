export interface KycDocument {
  doc_id: number;
  user_id: number;
  document_type: string;
  file_url: string;
  status: string;
}

export interface KycRequest {
  id: number;
  user_id: number;
  status: 'under_review' | 'approved' | 'rejected';
  created_at: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  kyc_status: boolean;
  pending_docs: string;
  approved_docs: string;
  documents: KycDocument[];
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  status: boolean;
  data?: T;
  message?: string;
}

