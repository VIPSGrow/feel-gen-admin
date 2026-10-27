import MediaUploadForm from '@/components/admin/media/MediaUploadForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Add Media - Admin',
    description: 'Upload images and videos',
};

export default function AddMediaPage() {
    return (
        <div className="space-y-6 p-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Add Media</h1>
            <MediaUploadForm />
        </div>
    );
}
