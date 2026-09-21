import type { ServerResponse } from '@/lib/constantFunction';
import type { User } from '@/lib/auth';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Ticket {
  id: number;
  case_id: string;
  user_id?: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: TicketStatus;
  created_at: string;
  updated_at?: string;
}

export interface Reply {
  id: number;
  ticket_id: number;
  replied_by: number;
  replied_by_type: 'USER' | 'DISTRIBUTOR' | 'ADMIN';
  message: string;
  is_admin: boolean;
  attachment?: string;
  created_at: string;
}

export interface TicketDetail extends Ticket {
  replies: Reply[];
}

export interface RaiseTicketPayload {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  user_id?: number;
  user_type: 'DISTRIBUTOR';
}

export interface ReplyPayload {
  message: string;
  attachment?: string;
}

export interface UpdateStatusPayload {
  status: TicketStatus;
}

// Responses
export type RaiseTicketResponse = ServerResponse<{ caseId: string }>;
export type TicketsResponse = ServerResponse<Ticket[] & { pagination?: { page: number; limit: number; total: number; totalPages: number } }>;
export type TicketResponse = ServerResponse<{ ticket: TicketDetail }>;
export type ReplyResponse = ServerResponse<Reply>;

