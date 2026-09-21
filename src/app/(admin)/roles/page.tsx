import RolesTable from '@/components/admin/RolesTable';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roles - Admin',
  description: 'Manage user roles',
};

export default function RolesPage() {
  return (
    <div className="space-y-6 p-6">
      <RolesTable />
    </div>
  );
}

