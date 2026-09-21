export interface Tax {
  id: number;
  tax_name: string;
  tax_percentage: string;
  state_code: string;
  country_code: string;
  is_inclusive: boolean;
  status: 'active' | 'inactive';
  created_at: string;
}

