"use client";

import React, { useState, useEffect } from 'react';
import { useBlogCategory } from '@/hooks/useBlogCategory';
import type { BlogCategory } from '@/types/blog';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHeader,
} from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import { Trash2, Edit3, PlusIcon } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import { Modal } from '../ui/modal';
import CategoryForm from './CategoryForm';

const CategoryTable = () => {
    const { categories, loading, error, fetchCategories, deleteCategory } = useBlogCategory();

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleEdit = (category: BlogCategory) => {
        setSelectedCategory(category);
        setShowEditModal(true);
    };

    const handleDelete = async (id: string | number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            const result = await deleteCategory(id);
            if (result.success) {
                fetchCategories();
            }
        }
    };

    const handleAddSuccess = () => {
        setShowAddModal(false);
        fetchCategories();
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        setSelectedCategory(null);
        fetchCategories();
    };

    if (loading && categories.length === 0) {
        return <div className="p-8 text-center">Loading categories...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-500">Error: {error}</div>;
    }

    return (
        <>
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Blog Categories
                        </h1>
                        <p className="text-muted-foreground dark:text-gray-300">
                            Manage your blog categories
                        </p>
                    </div>
                    <Button onClick={() => setShowAddModal(true)} startIcon={<PlusIcon />}>
                        Add Category
                    </Button>
                </div>

                <div className="rounded-xl border bg-card overflow-hidden bg-white dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">ID</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Name</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Slug</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-right">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {category.id}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            <Badge>{category.name}</Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {category.slug || 'N/A'}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(category.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" color="red" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {categories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No categories found. Add one above.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Add Category Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} className="max-w-md">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">
                        Add Category
                    </h2>
                    <CategoryForm onSuccess={handleAddSuccess} />
                </div>
            </Modal>

            {/* Edit Category Modal */}
            <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedCategory(null); }} className="max-w-md">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">
                        Edit Category
                    </h2>
                    <CategoryForm category={selectedCategory} onSuccess={handleEditSuccess} />
                </div>
            </Modal>
        </>
    );
};

export default CategoryTable;
