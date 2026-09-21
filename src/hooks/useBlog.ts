import { useState, useEffect, useCallback } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import type { 
  Blog, 
  BlogsResponse, 
  BlogResponse, 
  CreateBlogPayload, 
  UpdateBlogPayload,
  BlogComment,
  BlogCommentResponse,
  BlogCommentsResponse
} from '@/types/blog';

export const useBlog = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<BlogsResponse>('GET', 'api/blog/');
      if (response.success && response.data) {
        setBlogs(response.data);
      } else {
        setError(response.message || 'Failed to fetch blogs');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  }, []);

  const getBlog = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<BlogResponse>('GET', `api/blog/details/${id}`);
      if (response.success && response.data) {
        setBlog(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch blog');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog');
    } finally {
      setLoading(false);
    }
  }, []);

const createBlog = useCallback(async (payload: CreateBlogPayload, file?: File) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      
      // If there's a file, use FormData
      if (file) {
        const formDataToSend = new FormData();
        formDataToSend.append('title', payload.title);
        formDataToSend.append('content', payload.content);
        formDataToSend.append('category_id', payload.category_id.toString());
        formDataToSend.append('featured_image', file);
        if (payload.excerpt) formDataToSend.append('excerpt', payload.excerpt);
        if (payload.is_published !== undefined) formDataToSend.append('is_published', payload.is_published.toString());
        
        response = await serverCallFuction<BlogResponse>('POST', 'api/blog/', formDataToSend);
      } else {
        response = await serverCallFuction<BlogResponse>('POST', 'api/blog/', payload);
      }
      
      if (response.success && response.data) {
        setBlogs(prev => [response.data!, ...prev]);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to create blog');
        return { success: false, message: response.message };
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create blog');
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBlog = useCallback(async (id: string | number, payload: UpdateBlogPayload, file?: File) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      
      // If there's a file, use FormData
      if (file) {
        const formDataToSend = new FormData();
        if (payload.title) formDataToSend.append('title', payload.title);
        if (payload.content) formDataToSend.append('content', payload.content);
        if (payload.category_id) formDataToSend.append('category_id', payload.category_id.toString());
        formDataToSend.append('featured_image', file);
        if (payload.excerpt) formDataToSend.append('excerpt', payload.excerpt);
        if (payload.is_published !== undefined) formDataToSend.append('is_published', payload.is_published.toString());
        
        response = await serverCallFuction<BlogResponse>('PUT', `api/blog/${id}`, formDataToSend);
      } else {
        response = await serverCallFuction<BlogResponse>('PUT', `api/blog/${id}`, payload);
      }
      
      if (response.success && response.data) {
        setBlogs(prev => prev.map(b => b.id === id ? response.data! : b));
        if (blog?.id === id) setBlog(response.data);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to update blog');
        return { success: false, message: response.message };
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update blog');
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [blog]);

  const deleteBlog = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<BlogResponse>('DELETE', `api/blog/${id}`);
      if (response.success) {
        setBlogs(prev => prev.filter(b => b.id !== id));
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete blog');
        return { success: false, message: response.message };
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog');
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const approveComment = useCallback(async (commentId: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serverCallFuction<BlogCommentResponse>('PUT', `api/blog/comment/approve/${commentId}`);
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to approve comment');
        return { success: false, message: response.message };
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to approve comment');
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return {
    blogs,
    blog,
    loading,
    error,
    fetchBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    approveComment
  };
};
