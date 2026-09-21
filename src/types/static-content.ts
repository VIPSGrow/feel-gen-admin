export interface StaticContent {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  status: 'draft' | 'published';
  updated_at: string;
}

export interface States{
  id: number;
  name: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image_url?: string;
  mobile_image_url?: string;
  link_type?: string;
  link_value?: string;
  display_order: number;
  position?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}
