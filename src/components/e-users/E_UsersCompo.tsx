"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import serverCallFunction from '@/lib/constantFunction';
import { useAuth } from '@/context/AuthContext';
import { ResponsiveTable, Column } from '@/components/tables/ResponsiveTable';

type EcomUser = {
    id: number | string;
    username?: string;
    email?: string;
    phone?: string;
    status?: string;
    full_name?: string;
};

type EcomUsersResponse = {
    status?: boolean;
    success?: boolean;
    message?: string;
    data?: EcomUser[];
    users?: EcomUser[];
};

const DEFAULT_STATUSES = ['active', 'inactive', 'blocked', 'pending', 'verified'];

const getStatusOptions = (users: EcomUser[]) => {
    const fromApi = new Set<string>();
    for (const u of users) {
        const s = u?.status;
        if (typeof s === 'string' && s.trim()) fromApi.add(s);
    }
    if (fromApi.size > 0) {
        return Array.from(fromApi).sort((a, b) => a.localeCompare(b));
    }
    return DEFAULT_STATUSES;
};

export default function E_UsersCompo() {
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<EcomUser[]>([]);

    const { user } = useAuth();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `api/ecom/${user?.role_id ? 'super' : user?.role?.toLocaleLowerCase() === "super admin" ? 'super' : 'distributor'}/ecom-users`;
            const res = await serverCallFunction<EcomUsersResponse>('GET', url);
            const ok = res?.status !== false && res?.success !== false;
            if (!ok && res?.message) {
                throw new Error(res.message);
            }
            const resAny = res as any;
            const list: EcomUser[] = Array.isArray(resAny?.data)
                ? resAny.data
                : Array.isArray(resAny?.users)
                    ? resAny.users
                    : [];
            setUsers(list);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to load ecom-users';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const statusOptions = useMemo(() => getStatusOptions(users), [users]);

    const onUpdateStatus = useCallback(
        async (id: number | string, nextStatus: string) => {
            setUpdatingId(id);
            setError(null);
            try {
                type PatchRes = { status?: boolean; success?: boolean; message?: string };
                const res = await serverCallFunction<PatchRes>(
                    'PATCH',
                    `api/ecom/super/ecom-users/${id}/status`,
                    { status: nextStatus }
                );
                const ok = res?.status !== false && res?.success !== false;
                if (!ok) {
                    throw new Error(res?.message || 'Status update failed');
                }
                setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u)));
                await fetchUsers();
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Failed to update status';
                setError(msg);
                await fetchUsers();
            } finally {
                setUpdatingId(null);
            }
        },
        [fetchUsers]
    );

    const ecomColumns: Column<EcomUser>[] = [
        { header: 'ID', cell: (u) => String(users.indexOf(u) + 1) },
        { header: 'Username', cell: (u) => u.username || u.full_name || '—' },
        { header: 'Email', cell: (u) => u.email || '—' },
        { header: 'Phone', cell: (u) => u.phone || '—' },
        { header: 'Status', cell: (u) => ((u.status ?? 'unknown') ? 'Active' : 'Block | Pending') },
    ];

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">E-Users</h1>
                <button
                    className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:bg-gray-400"
                    onClick={fetchUsers}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

            <div className="overflow-x-auto rounded-xl ">
                {loading ? (
                    <div className="px-4 py-10 text-center text-gray-500">Loading...</div>
                ) : (
                    <ResponsiveTable<EcomUser>
                        columns={ecomColumns}
                        data={users}
                        keyExtractor={(u) => String(u.id)}
                        emptyText="No ecom-users found."
                    />
                )}
            </div>
        </div>
    );
}