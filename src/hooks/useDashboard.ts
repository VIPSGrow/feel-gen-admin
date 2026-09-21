"use client"
import { useState, useEffect, useCallback } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import type { DashboardResponse, DashboardData, DistributorDashboardResponse, DistributorDashboardData } from '@/types/dashboard';
import { useAuth } from '@/context/AuthContext';

export function useDashboard() {
  const [data, setData] = useState<DashboardData | DistributorDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDistributor, setIsDistributor] = useState<boolean>(false);

  const {user} = useAuth()

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Normalize role check - check both uppercase and lowercase
      const userRole = user?.role?.toLowerCase() || '';
      const isDistRole = userRole === 'distributor';
      
      let url = 'api/dashboard'

      if(isDistRole){
        url = 'api/dashboard/me'
        setIsDistributor(true);
      } else {
        setIsDistributor(false);
      }

      if (isDistRole) {
        const response = (await serverCallFuction<DistributorDashboardResponse>('GET', url)) as DistributorDashboardResponse;
        if (response.success && response.data) {
          setData(response.data as DistributorDashboardData);
        } else {
          setError(response.message || 'Failed to fetch dashboard data');
        }
      } else {
        const response = (await serverCallFuction<DashboardResponse>('GET', url)) as DashboardResponse;
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.message || 'Failed to fetch dashboard data');
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard, isDistributor };
}

