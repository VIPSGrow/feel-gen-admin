import type { ServerResponse } from '@/lib/constantFunction';

export interface Notification {
  id: number | string;
  sender_id: number | string;
  title: string;
  message: string;
  image_url?: string | null;
  display_type: string;
  target_role: string;
  target_id?: number | string | null;
  priority: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateNotificationPayload {
  sender_id: number | string;
  title: string;
  message: string;
  image_url?: string | null;
  display_type: string;
  target_role: string;
  target_id?: number | string | null;
  priority: string;
}

export type NotificationsResponse = ServerResponse<Notification[]>;
export type NotificationResponse = ServerResponse<Notification>;

