import type { ServerResponse } from '@/lib/constantFunction';

export interface Role {
  id: number | string;
  name: string;
  description?: string;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissions?: string[];
}

export type RolesResponse = ServerResponse<Role[]>;
export type RoleResponse = ServerResponse<Role>;

