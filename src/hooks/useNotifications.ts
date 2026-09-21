import { useState, useCallback } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import type {
  Notification,
  NotificationsResponse,
  NotificationResponse,
  CreateNotificationPayload,
} from '@/types/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = (await serverCallFuction<NotificationsResponse>(
        'GET',
        'api/notifications'
      )) as NotificationsResponse;
      if (response.status) {
        setNotifications(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch notifications');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getNotificationById = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await serverCallFuction<NotificationResponse>(
        'GET',
        `api/notifications/${id}`
      )) as NotificationResponse;
      if (response.status) {
        return response.data || null;
      } else {
        setError(response.message || 'Failed to fetch notification');
        return null;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch notification';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createNotification = useCallback(async (payload: CreateNotificationPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await serverCallFuction<NotificationResponse>(
        'POST',
        'api/notifications',
        payload
      )) as NotificationResponse;
      if (response.status && response.data) {
        setNotifications((prev) => [response.data!, ...prev]);
        return { success: true };
      } else {
        setError(response.message || 'Failed to create notification');
        return { success: false, error: response.message };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create notification';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await serverCallFuction<NotificationResponse>(
        'DELETE',
        `api/notifications/${id}`
      )) as NotificationResponse;
      if (response.status) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete notification');
        return { success: false, error: response.message };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete notification';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    getNotificationById,
    createNotification,
    deleteNotification,
  };
}

