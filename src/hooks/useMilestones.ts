import { useState, useCallback } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import type { Milestone, MilestonesResponse, MilestoneResponse, CreateMilestonePayload, UpdateMilestonePayload } from '@/types/commission-type';

export function useMilestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<MilestonesResponse>('GET', 'api/milestones') as MilestonesResponse;
      if (response.status) {
        setMilestones(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch milestones');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch milestones';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMilestone = useCallback(async (payload: CreateMilestonePayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<MilestoneResponse>('POST', 'api/milestones', payload) as MilestoneResponse;
      if (response.status && response.data) {
        setMilestones(prev => [response.data!, ...prev]);
        return { success: true };
      } else {
        setError(response.message || 'Failed to create milestone');
        return { success: false, error: response.message };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create milestone';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMilestone = useCallback(async (id: string | number, payload: UpdateMilestonePayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<MilestoneResponse>('PUT', `api/milestones/${id}`, payload) as MilestoneResponse;
      if (response.status && response.data) {
        setMilestones(prev => prev.map(m => m.id === id ? response.data! : m));
        return { success: true };
      } else {
        setError(response.message || 'Failed to update milestone');
        return { success: false, error: response.message };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update milestone';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMilestone = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<MilestoneResponse>('DELETE', `api/milestones/${id}`) as MilestoneResponse;
      if (response.status) {
        setMilestones(prev => prev.filter(m => m.id !== id));
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete milestone');
        return { success: false, error: response.message };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete milestone';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    milestones,
    loading,
    error,
    fetchMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
  };
}

