import MilestonesTable from '@/components/admin/commissions/MilestonesTable';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Level Milestones - Admin',
    description: 'Manage level milestones and rewards',
};

export default function LevelMilestonePage() {
    return (
        <div className="space-y-6">
            <MilestonesTable />
        </div>
    );
}
