"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BlogForm from '@/components/admin/BlogForm';
import { useBlog } from '@/hooks/useBlog';
import type { Blog } from '@/types/blog';

export default function EditBlogPage() {
    const router = useRouter();
    const params = useParams();
    const { getBlog, loading } = useBlog();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [blogLoading, setBlogLoading] = useState(true);

    const blogId = Array.isArray(params.id) ? params.id[0] : params.id;

    useEffect(() => {
        const fetchBlog = async () => {
            if (blogId) {
                setBlogLoading(true);
                const result = await getBlog(blogId);


                if (result) {
                    setBlog(result as Blog);
                }
                setBlogLoading(false);
            }
        };

        fetchBlog();
    }, [blogId, getBlog]);

    if (blogLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading blog...</div>
            </div>
        );
    }




    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight dark:text-gray-300">Edit Blog Post</h1>
                        <p className="text-muted-foreground dark:text-gray-500 text-sm">Edit existing blog post</p>
                    </div>
                </div>
            </div>
            <div className="rounded-xl border bg-card overflow-hidden bg-white dark:bg-gray-900 p-6">
                <BlogForm blog={blog} isEdit={true} />
            </div>
        </>
    );
}
