"use client";

import React, { useState, useEffect } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import { slugify } from '@/lib/slugify';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Alert from '@/components/ui/alert/Alert';
import { Modal } from '@/components/ui/modal';
import { Plus, Edit, Trash2, ChevronRight } from 'lucide-react'; // Assume icons available or use SVG

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  status: 'active' | 'inactive';
  created_at: string;
  parent?: Category;
  children?: Category[];
  level?: number;
}

const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: '' as string | number,
    status: 'active' as 'active' | 'inactive',
  });
  const [parents, setParents] = useState<Category[]>([]); // For select options
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await serverCallFuction('GET', 'api/products/categories');
      if (res.status) {
        // Build hierarchy: add parent prop for display
        const catsWithParent: Category[] = res.data.map((cat: Category) => ({
          ...cat,
          parent_id: cat.parent_id || null,
        }));
        setCategories(buildTree(catsWithParent));
        setParents(buildFlatParents(catsWithParent));
        setError('');
      } else {
        setError(res.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (cats: Category[]): Category[] => {
    const map: Map<number, Category> = new Map();
    cats.forEach(cat => map.set(cat.id, { ...cat, children: [] }));
    const tree: Category[] = [];
    cats.forEach(cat => {
      if (cat.parent_id === null) {
        tree.push(map.get(cat.id)!);
      } else {
        const parent = map.get(cat.parent_id!);
        if (parent) parent.children!.push(map.get(cat.id)!);
      }
    });
    return flattenTree(tree);
  };

  const flattenTree = (nodes: Category[], level = 0): Category[] => {
    const flat: Category[] = [];
    nodes.forEach(node => {
      node.level = level;
      flat.push(node);
      if (node.children) {
        flat.push(...flattenTree(node.children, level + 1));
      }
    });
    return flat;
  };

  const buildFlatParents = (cats: Category[]): Category[] => {
    return cats.filter(cat => cat.parent_id === null).map(cat => ({ ...cat, name: `— ${cat.name}` }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setFormData({
        ...formData,
        [name]: value,
        slug: slugify(value),
      });
    } else {
      setFormData({ ...formData, [name]: name === 'parent_id' ? (value === '' ? null : Number(value)) : value });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', parent_id: '', status: 'active' });
    setSelectedCategory(null);
  };

  const handleCreate = async () => {
    try {
      setSubmitLoading(true);
      const payload = {
        ...formData,
        parent_id: formData.parent_id === '' ? null : Number(formData.parent_id),
      };
      const data = await serverCallFuction('POST', 'api/products/category/create', payload);
      if (data.success !== false) { // Assume truthy if success
        fetchCategories();
        // setCategories(categories.concat(data.data))
        setIsCreateModalOpen(false);
        resetForm();
      } else {
        setError(data.message || 'Failed to create category');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCategory) return;
    try {
      setSubmitLoading(true);
      const payload = {
        ...formData,
        parent_id: formData.parent_id === '' ? null : Number(formData.parent_id),
        id: selectedCategory.id
      };
      const data = await serverCallFuction('PUT', `api/products/category/update`, payload);
      if (data.success !== false) {

        fetchCategories();
        setIsEditModalOpen(false);
        resetForm();
      } else {
        setError(data.message || 'Failed to update category');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure to delete this category?')) return;
    try {
      const data = await serverCallFuction('DELETE', `api/products/category/${id}`);
      if (data.success) {
        // fetchCategories();
        setCategories(categories.filter(cat => cat.id !== id))
      } else {
        setError(data.message || 'Failed to delete category');
      }
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  const openEdit = (cat: Category) => {
    setFormData({
      name: cat.name,
      slug: cat.slug,
      parent_id: cat.parent_id?.toString() || '',
      status: cat.status,
    });
    setSelectedCategory(cat);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-gray-300">Categories</h1>
          <p className="text-muted-foreground dark:text-gray-400">Manage your product categories</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setIsCreateModalOpen(true);
        }} startIcon={<Plus className="h-4 w-4" />}>
          Create Category
        </Button>
      </div>

      {error && (
        <Alert variant="error" title="Error" message={error} />
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="rounded-xl border bg-white dark:bg-gray-900 overflow-hidden">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Name</TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Slug</TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Status</TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Created</TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                      <span style={{ paddingLeft: `${cat.level! * 20}px` }}>
                        {cat.parent_id && <ChevronRight className="h-4 w-4 inline mr-1" />}
                        {cat.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{cat.slug}</TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    <Badge color={cat.status === 'active' ? 'success' : 'error'} variant="light" size="sm">
                      {cat.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(cat.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        startIcon={<Edit className="h-3 w-3" />}
                        onClick={() => openEdit(cat)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        startIcon={<Trash2 className="h-3 w-3" color='red' />}
                        onClick={() => handleDelete(cat.id)}
                      />


                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
          }}
          className='max-w-lg mx-auto'

        >
          <div className="p-6">
            <h2 className="text-lg font-bold mb-6">
              {isEditModalOpen ? 'Edit Category' : 'Create Category'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                  placeholder='Enter category name'
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50"
                  required
                  placeholder='slug-auto generated'
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Parent Category</label>
                <select
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">— No parent —</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={isEditModalOpen ? handleEdit : handleCreate}
                disabled={submitLoading || !formData.name || !formData.slug}
              >
                {submitLoading ? 'Saving...' : (isEditModalOpen ? 'Update' : 'Create')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CategoryPage;

