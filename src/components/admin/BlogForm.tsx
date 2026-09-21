"use client";

import React, { useState, useEffect } from 'react';
import { useBlog } from '@/hooks/useBlog';
import { useBlogCategory } from '@/hooks/useBlogCategory';
import type { Blog, CreateBlogPayload, UpdateBlogPayload } from '@/types/blog';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { Image as ImageIcon } from 'lucide-react';
import DropZone from '@/components/form/DropZone';
import { useRouter } from 'next/navigation';

interface BlogFormProps {
    blog?: Blog | null;
    isEdit?: boolean;
}

const BlogForm: React.FC<BlogFormProps> = ({ blog, isEdit = false }) => {
    const router = useRouter();
    const { createBlog, updateBlog, loading } = useBlog();
    const { categories, fetchCategories } = useBlogCategory();

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Initialize form data - directly for edit mode, empty for create mode
    const initialFormData: CreateBlogPayload = isEdit && blog ? {
        title: blog.title,
        content: blog.content,
        category_id: blog.category_id,
        featured_image: blog.featured_image || '',
        excerpt: blog.excerpt || '',
        is_published: blog.is_published || false,
    } : {
        title: '',
        content: '',
        category_id: 0,
        featured_image: '',
        excerpt: '',
        is_published: false,
    };

    const [formData, setFormData] = useState<CreateBlogPayload>(initialFormData);

    // State for featured image file
    const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);

    // Initialize preview - for edit mode use existing image
    const [featuredImagePreview, setFeaturedImagePreview] = useState<string>(
        isEdit && blog?.featured_image ? blog.featured_image : ''
    );

    // Handler for featured image selection from DropZone
    const handleFeaturedImageChange = (files: File[]) => {
        const file = files[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setFeaturedImageFile(file);
            setFeaturedImagePreview(preview);
            // Clear the URL-based featured_image since we're using a file now
            setFormData(prev => ({ ...prev, featured_image: '' }));
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.content || !formData.category_id) return;

        let result;
        if (isEdit && blog) {
            result = await updateBlog(blog.id, formData as UpdateBlogPayload, featuredImageFile || undefined);
        } else {
            result = await createBlog(formData, featuredImageFile || undefined);
        }

        if (result.success) {
            router.push('/blog');
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <Label htmlFor="title">Title *</Label>
                    <input
                        id="title"
                        type="text"
                        defaultValue={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter blog title"
                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    />
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <input
                        id="excerpt"
                        type="text"
                        defaultValue={formData.excerpt || ''}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        placeholder="Enter short excerpt"
                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    />
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor="category_id">Category *</Label>
                    <select
                        id="category_id"
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-900 dark:border-gray-700"
                        required
                    >
                        <option value={0}>Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <Label>Featured Image</Label>
                    <DropZone
                        onFilesChange={handleFeaturedImageChange}
                        maxFiles={1}
                        label="Drag & drop featured image or click to browse"
                    />
                    {(featuredImagePreview || formData.featured_image) && (
                        <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                                <ImageIcon className="h-8 w-8 text-gray-500" />
                                <div className="flex-1">
                                    <p className="font-medium">Featured Image Preview</p>
                                    <img
                                        src={featuredImagePreview || formData.featured_image}
                                        alt="Preview"
                                        className="mt-2 max-h-32 rounded object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor="content">Content *</Label>
                    <textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Enter blog content"
                        rows={12}
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-900 dark:border-gray-700"
                        required
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.is_published || false}
                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">Publish immediately</span>
                    </label>
                </div>
            </div>
            <div className="flex gap-3 justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/blog')}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!formData.title || !formData.content || !formData.category_id || loading}
                >
                    {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                </Button>
            </div>
        </div>
    );
};

export default BlogForm;
