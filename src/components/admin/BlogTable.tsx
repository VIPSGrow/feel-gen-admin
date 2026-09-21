"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBlog } from '@/hooks/useBlog';
import type { Blog, BlogComment } from '@/types/blog';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHeader,
} from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import { Trash2, Edit3, Plus, PlusIcon, Check } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import { Modal } from '../ui/modal';
import { date_formate } from '@/lib/constantFunction';

const BlogTable = () => {
    const router = useRouter();
    const { blogs, loading, error, deleteBlog, approveComment } = useBlog();

    const [viewingComments, setViewingComments] = useState(false);
    const [selectedBlogComments, setSelectedBlogComments] = useState<BlogComment[]>([]);
    const [selectedBlogId, setSelectedBlogId] = useState<number | string | null>(null);

    const handleEdit = (blogItem: Blog) => {
        router.push(`/blog/${blogItem?.slug}/edit`);
    };

    const handleDelete = async (id: string | number) => {
        if (confirm('Are you sure you want to delete this blog post?')) {
            const result = await deleteBlog(id);
            if (result.success) {
                // Success toast or message if available
            }
        }
    };

    const handleViewComments = (blogItem: Blog) => {
        setSelectedBlogComments(blogItem.comments || []);
        setSelectedBlogId(blogItem.id);
        setViewingComments(true);
    };

    const handleApproveComment = async (commentId: string | number) => {
        const result = await approveComment(commentId);
        if (result.success) {
            // Update local state
            setSelectedBlogComments(prev =>
                prev.map(c => c.id === commentId ? { ...c, is_approved: true } : c)
            );
        }
    };

    const openCreatePage = () => {
        router.push('/blog/add');
    };

    if (loading && blogs.length === 0) return <div className="p-8 text-center">Loading blogs...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    return (
        <>
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Blog Management
                        </h1>
                        <p className="text-muted-foreground dark:text-gray-300">
                            Manage your blog posts
                        </p>
                    </div>
                    <Button onClick={openCreatePage} startIcon={<PlusIcon />}>
                        Create Post
                    </Button>
                </div>

                <div className="rounded-xl border bg-card overflow-hidden bg-white dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Title</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Category</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Status</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Created At</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-right">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {blogs.map((blogItem) => (
                                    <TableRow key={blogItem.id}>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">{blogItem.title}</TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            <Badge>{blogItem?.category_name || 'N/A'}</Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {blogItem.is_published ? (
                                                <Badge color="success">Published</Badge>
                                            ) : (
                                                <Badge color="warning">Draft</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {blogItem.created_at ? date_formate(blogItem.created_at) : 'N/A'}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline" onClick={() => handleViewComments(blogItem)}>
                                                    Comments
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleEdit(blogItem)}>
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(blogItem.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" color="red" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {blogs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No blog posts found. Create one above.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Comments Modal */}
                <Modal isOpen={viewingComments} onClose={() => { setViewingComments(false); setSelectedBlogComments([]); }} className="max-w-3xl">
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-6">
                            Comments
                        </h2>
                        {selectedBlogComments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No comments yet for this post.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedBlogComments.map((comment) => (
                                    <div key={comment.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">{comment.user_name || 'Anonymous'}</p>
                                                <p className="text-sm text-gray-500">{comment.comment}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {comment.created_at ? date_formate(comment.created_at) : ''}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {comment.is_approved ? (
                                                    <Badge color="success">Approved</Badge>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApproveComment(comment.id)}
                                                        startIcon={<Check className="w-4 h-4" />}
                                                    >
                                                        Approve
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-3 mt-6 justify-end">
                            <Button type="button" variant="outline" onClick={() => { setViewingComments(false); setSelectedBlogComments([]); }}>
                                Close
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    );
};

export default BlogTable;
