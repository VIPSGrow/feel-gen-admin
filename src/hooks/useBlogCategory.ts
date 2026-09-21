import { useState, useEffect, useCallback } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import type { 
  BlogCategory, 
  BlogCategoryResponse, 
  BlogCategoriesResponse,
  CreateCategoryPayload, 
  UpdateCategoryPayload 
} from '@/types/blog';

export const useBlogCategory = () => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<BlogCategoriesResponse>('GET', 'api/blog/categories');
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError(response.message || 'Failed to fetch categories');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategory = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<BlogCategoryResponse>('GET', `api/blog/categories/${id}`);
      if (response.success && response.data) {
        setCategory(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch category');
        return null;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch category');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (payload: CreateCategoryPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<BlogCategoryResponse>('POST', 'api/blog/categories', payload);
      
      if (response.success && response.data) {
        setCategories(prev => [...prev, response.data!]);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to create category');
        return { success: false, message: response.message };
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string | number, payload: UpdateCategoryPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<BlogCategoryResponse>('PUT', `api/blog/categories/${id}`, payload);
      
      if (response.success && response.data) {
        setCategories(prev => prev.map(c => c.id === id ? response.data! : c));
        if (category?.id === id) setCategory(response.data);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to update category');
        return { success: false, message: response.message };
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [category]);

  const deleteCategory = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<BlogCategoryResponse>('DELETE', `api/blog/categories/${id}`);
      if (response.success) {
        setCategories(prev => prev.filter(c => c.id !== id));
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete category');
        return { success: false, message: response.message };
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    category,
    loading,
    error,
    fetchCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
  };
};
