import BlogForm from '@/components/admin/BlogForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Add Blog - Dashboard | Feel safe",
    description: "Create a new blog post",
};

const AddBlogPage = () => {
    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight dark:text-gray-300">Create Blog Post</h1>
                        <p className="text-muted-foreground dark:text-gray-500 text-sm">Create a new blog post</p>
                    </div>
                </div>
            </div>
            <div className="rounded-xl border bg-card overflow-hidden bg-white dark:bg-gray-900 p-6">
                <BlogForm />
            </div>
        </>
    );
};

export default AddBlogPage;
