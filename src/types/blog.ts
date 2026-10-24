import type { ServerResponse } from '@/lib/constantFunction';

export type BlogStatus = 'draft' | 'published';

export interface Blog {
  id: number | string;
  title: string;
  content: string;
  category_id: number;
  featured_image: string;
  slug?: string;
  excerpt?: string;
  author_id?: number;
  author_name?: string;
  status?: BlogStatus;
  view_count?: number;
  created_at?: string;
  updated_at?: string;
  category_name?: string; 
  comments?: BlogComment[];
}

export interface BlogCategory {
  id: number | string;
  name: string;
  slug?: string;
}

export interface CreateBlogPayload {
  title: string;
  slug?: string;
  content: string;
  category_id: number;
  featured_image: string;
  excerpt?: string;
  status?: BlogStatus;
}

export interface UpdateBlogPayload {
  title?: string;
  slug?: string;
  content?: string;
  category_id?: number;
  featured_image?: string;
  excerpt?: string;
  status?: BlogStatus;
}

export interface BlogComment {
  id: number | string;
  blog_id: number | string;
  user_id?: number;
  user_name?: string;
  comment: string;
  is_approved: boolean;
  created_at?: string;
}

export type BlogsResponse = ServerResponse<Blog[]>;
export type BlogResponse = ServerResponse<Blog>;
export type BlogCommentResponse = ServerResponse<BlogComment>;
export type BlogCommentsResponse = ServerResponse<BlogComment[]>;

// Category Types
export type BlogCategoryResponse = ServerResponse<BlogCategory>;
export type BlogCategoriesResponse = ServerResponse<BlogCategory[]>;

export interface CreateCategoryPayload {
  name: string;
}

export interface UpdateCategoryPayload {
  name: string;
}
