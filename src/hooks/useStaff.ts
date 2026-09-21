import { useState, useEffect, useCallback } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import type { Staff, StaffsResponse, StaffResponse, CreateStaffPayload, UpdateStaffPayload } from '@/types/staff';

export const useStaff = () => {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<StaffsResponse>('GET', 'api/staff/');
      if (response.status && response.data) {
        setStaffs(response.data);
      } else {
        setError(response.message || 'Failed to fetch staffs');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staffs');
    } finally {
      setLoading(false);
    }
  }, []);

  const getStaff = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<StaffResponse>('GET', `api/staff/${id}`);
      if (response.status && response.data) {
        setStaff(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch staff');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  }, []);

  const createStaff = useCallback(async (payload: CreateStaffPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<StaffResponse>('POST', 'api/staff', payload);
      if (response.status && response.data) {
        setStaffs(prev => [response.data!, ...prev]);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to create staff');
        return { success: false, message: response.message };
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create staff');
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStaff = useCallback(async (id: string | number, payload: UpdateStaffPayload) => {
    console.log("update staff call");
    
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<StaffResponse>('PUT', `api/staff/${id}`, payload);
      if (response.status && response.data) {
        setStaffs(prev => prev.map(s => s.id === id ? response.data! : s));
        if (staff?.id === id) setStaff(response.data);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to update staff');
        return { success: false, message: response.message };
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update staff');
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [staff]);

  const deleteStaff = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<StaffResponse>('DELETE', `api/staff/${id}`);
      if (response.status) {
        setStaffs(prev => prev.filter(s => s.id !== id));
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete staff');
        return { success: false, message: response.message };
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete staff');
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  return {
    staffs,
    staff,
    loading,
    error,
    fetchStaffs,
    getStaff,
    createStaff,
    updateStaff,
    deleteStaff
  };
};

