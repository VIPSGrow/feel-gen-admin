import { useState, useCallback } from 'react';

import type { 
  RaiseTicketPayload, ReplyPayload, UpdateStatusPayload,
  TicketsResponse, TicketResponse, ReplyResponse,
  TicketStatus 
} from '@/types/ticket';
import serverCallFuction from '@/lib/constantFunction';

export function useSupportTickets() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async <T = unknown>(fn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err: unknown) {
      const errObj = err as any;
      setError(errObj?.error || 'API error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const raiseTicket = useCallback(async (formData: FormData) => {
    return execute(() => serverCallFuction( 'POST', 
      'api/support/raise-ticket', 
      formData));
  }, [execute]);

  const getMyTickets = useCallback(async () => {
    // return execute<TicketsResponse>(() => serverCallFunction<TicketsResponse>('/my-tickets'));
    return execute<TicketsResponse>(() => serverCallFuction<TicketsResponse>('GET', 'api/support/dis/my-tickets'));
  }, [execute]);

  const getTicket = useCallback(async (caseId: string) => {
    return execute<TicketResponse>(() => serverCallFuction<TicketResponse>('GET', `api/support/${caseId}`));
  }, [execute]);

  const replyToTicket = useCallback(async (caseId: string, payload: FormData | ReplyPayload): Promise<ReplyResponse> => {
    return execute<ReplyResponse>(() => serverCallFuction<ReplyResponse>('POST', `api/support/${caseId}/reply`, payload));
  }, [execute]);

  const getAdminTickets = useCallback(async (params: { page?: number; limit?: number; status?: TicketStatus } = {}) => {
    const searchParams = new URLSearchParams(params as any);
    const endpoint = searchParams.toString() ? `api/support/admin/all?${searchParams}` : 'api/support/admin/all';
    return execute<TicketsResponse>(() => serverCallFuction<TicketsResponse>( 'GET', endpoint));
  }, [execute]);

  const updateTicketStatus = useCallback(async (id: number, payload: UpdateStatusPayload) => {
    return execute(() => serverCallFuction('PUT', `api/support/${id}/status`, payload));
  }, [execute]);

  return {
    loading,
    error,
    raiseTicket,
    getMyTickets,
    getTicket,
    replyToTicket,
    getAdminTickets,
    updateTicketStatus,
  };
}

