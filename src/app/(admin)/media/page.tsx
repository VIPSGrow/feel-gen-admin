import MediaList from '@/components/admin/media/MediaList';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Media - Admin',
    description: 'Manage images and videos',
};

export default function MediaPage() {
    return (
        <div className="space-y-6 p-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Media</h1>
            <MediaList />
        </div>
    );
}
