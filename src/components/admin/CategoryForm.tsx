"use client";

import React, { useState, useEffect } from 'react';
import type { BlogCategory, CreateCategoryPayload, UpdateCategoryPayload } from '@/types/blog';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import { useBlogCategory } from '@/hooks/useBlogCategory';

interface CategoryFormProps {
    category?: BlogCategory | null;
    onSuccess?: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSuccess }) => {
    const { createCategory, updateCategory, loading } = useBlogCategory();
    const [formData, setFormData] = useState<CreateCategoryPayload>({
        name: category?.name || ''
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (category) {
            setFormData({ name: category.name });
        }
    }, [category]);

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setError('Category name is required');
            return;
        }

        setError(null);
        let result;

        if (category) {
            result = await updateCategory(category.id, formData as UpdateCategoryPayload);
        } else {
            result = await createCategory(formData);
        }

        if (result.success) {
            if (onSuccess) onSuccess();
        } else {
            setError(result.message || 'Failed to save category');
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="categoryName">Category Name *</Label>
                <input
                    id="categoryName"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    placeholder="Enter category name"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                />
            </div>

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="flex gap-3 justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        setFormData({ name: '' });
                        setError(null);
                    }}
                >
                    Reset
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!formData.name.trim() || loading}
                >
                    {loading ? 'Saving...' : category ? 'Update' : 'Create'}
                </Button>
            </div>
        </div>
    );
};

export default CategoryForm;
