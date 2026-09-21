import { useState, useCallback } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import type { Role, RolesResponse, RoleResponse, CreateRolePayload, UpdateRolePayload } from '@/types/role';

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<RolesResponse>('GET', 'api/roles') as RolesResponse;
      if (response.status) {
        setRoles(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch roles');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = useCallback(async (payload: CreateRolePayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<RoleResponse>('POST', 'api/roles', payload) as RoleResponse;
      if (response.status && response.data) {
        setRoles(prev => [response.data!, ...prev]);
        return { success: true };
      } else {
        setError(response.message || 'Failed to create role');
        return { success: false, error: response.message };
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create role');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRole = useCallback(async (id: string | number, payload: UpdateRolePayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<RoleResponse>('PUT', `api/roles/${id}`, payload) as RoleResponse;
      if (response.status && response.data) {
        setRoles(prev => prev.map(role => role.id === id ? response.data! : role));
        return { success: true };
      } else {
        setError(response.message || 'Failed to update role');
        return { success: false, error: response.message };
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRole = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<RoleResponse>('DELETE', `api/roles/${id}`) as RoleResponse;
      if (response.status) {
        setRoles(prev => prev.filter(role => role.id !== id));
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete role');
        return { success: false, error: response.message };
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete role');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  };
}

