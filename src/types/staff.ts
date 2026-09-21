import type { ServerResponse } from '@/lib/constantFunction';

export interface Staff {
  id: number | string;
  full_name: string;
  email: string;
  phone: string;
  role_id: number;
  department: string;
  designation: string;
  salary: number;
  hire_date: string;
  manager_id?: number | null;
  role_name?:string;
  role?: { id: number; name: string }; // Optional for display
  created_at?: string;
  updated_at?: string;
}

export interface CreateStaffPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role_id: number;
  department: string;
  designation: string;
  salary: number;
  hire_date: string;
  manager_id?: number | null;
}

export interface UpdateStaffPayload {
  full_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role_id?: number;
  department?: string;
  designation?: string;
  salary?: number;
  hire_date?: string;
  manager_id?: number | null;
}

export type StaffsResponse = ServerResponse<Staff[]>;
export type StaffResponse = ServerResponse<Staff>;

