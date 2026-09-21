import NotificationsTable from '@/components/admin/NotificationsTable';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications - Admin',
  description: 'Manage and send notifications',
};

export default function NotificationsPage() {
  return (
    <div className="space-y-6 p-6">
      <NotificationsTable />
    </div>
  );
}

