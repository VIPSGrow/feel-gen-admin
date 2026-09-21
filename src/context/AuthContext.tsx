"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, rolePermissions } from '@/lib/auth';
import type { Role, RolesResponse } from '@/types/role';
import serverCallFuction from '@/lib/constantFunction';

interface AuthContextType {
  user: User | null;
  login: (data: { token: string, user: User }) => void;
  logout: () => void;
  updateUserProfile: (profileData: Partial<User>) => void;
  isAuthenticated: boolean;
  role: string | null;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dynamicPermissions, setDynamicPermissions] = useState<Record<string, string[]>>({});

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('user');
      }
    } else if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const parsedUser: User = {
          id: payload.id || payload.sub || '',
          phone: payload.phone || '',
          username: payload.username || '',
          // role: payload.role || '',
          permissions: payload.permissions || [], // <--- MUST ADD THIS
        };
        setUser(parsedUser);
        localStorage.setItem('user', JSON.stringify(parsedUser));
      } catch {
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  }, []);

  // Fetch dynamic roles when user is set
  useEffect(() => {
    if (user) {
      fetchRoles();
    }
  }, [user]);

  const fetchRoles = async () => {
    try {
      const resp = await serverCallFuction<RolesResponse>('GET', 'api/roles');
      if (resp.status && resp.data) {
        const map: Record<string, string[]> = {};
        resp.data.forEach((role: Role) => {
          map[role.name.toLowerCase()] = role.permissions || [];
        });
        setDynamicPermissions(map);
      }
    } catch (error) {
      // console.error('Failed to fetch roles:', error);
      // Fallback to static
    }
  };

  const login = (data: { token: string, user: User }) => {
    const { token, user } = data;
    document.cookie = `authToken=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=strict`;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setDynamicPermissions({});
  };

  const isAuthenticated = !!user;
  const role = user?.role_id ? user?.role_name : user?.role || null;

  // const hasPermission = (permission: string): boolean => {
  //   if (!user) return false;
  //   const roleKey = user.role.toLowerCase();
  //   console.log("DEGUB - ROlE - ",roleKey);

  //   const perms = dynamicPermissions[roleKey] || rolePermissions[roleKey] || [];
  //   console.log("\n\n\n Dynamic perss - ", perms);

  //   return perms.includes('*') || perms.includes(permission);
  // };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    const roleKey = user.role_id ? user?.role_name?.toLowerCase() : user.role.toLowerCase();

    // console.log("\n role key - auth context == ",roleKey);

    // 1. Check permissions directly from the JWT Payload (Staff specific)
    // Logic: Handles 'orders' matching 'orders.view' or 'orders'
    // console.log("role permission - ", permission, user.role_permissions);

    if (user.role_permissions && Array.isArray(user.role_permissions)) {
      const hasDirectAccess = user.role_permissions.some(p =>
        p === '*' ||
        p === permission ||
        p.startsWith(`${permission}.`)
      );
      // console.log("has direct access  - ", hasDirectAccess);

      if (hasDirectAccess) return true;
    }

    // 2. Fallback: Check Dynamic Permissions (Fetched from DB) or Static
    const perms = dynamicPermissions[roleKey] || rolePermissions[roleKey] || [];

    // console.log("dynamic - ", dynamicPermissions);

    return perms.includes('*') ||
      perms.includes(permission) ||
      perms.some(p => p.startsWith(`${permission}.`));
  };

  const updateUserProfile = (profileData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...profileData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      updateUserProfile,
      isAuthenticated,
      role,
      hasPermission,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

