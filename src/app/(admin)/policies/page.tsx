import PoliciesTable from '@/components/admin/policies/PoliciesTable';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Policies - Admin',
    description: 'Manage policies',
};

export default function PoliciesPage() {
    return (
        <div className="space-y-6 p-6">
            <PoliciesTable />
        </div>
    );
}

