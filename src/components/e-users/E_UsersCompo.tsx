"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import serverCallFunction from '@/lib/constantFunction';
import { useAuth } from '@/context/AuthContext';

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

    // If backend is consistent and returns status values, use those.
    if (fromApi.size > 0) {
        return Array.from(fromApi).sort((a, b) => a.localeCompare(b));
    }

    // Otherwise fall back to a reasonable list.
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

            const url = `api/ecom/${user?.role_id ? 'super' : user?.role.toLocaleLowerCase() === "super admin" ? 'super' : 'distributor'}/ecom-users`;


            const res = await serverCallFunction<EcomUsersResponse>('GET', url);

            // serverCallFunction returns either T or {status:false,...}
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
    }, []);

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


                // Optimistic update, then refresh to ensure consistency.
                setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u)));
                await fetchUsers();
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Failed to update status';
                setError(msg);
                // revert best-effort by re-fetching
                await fetchUsers();
            } finally {
                setUpdatingId(null);
            }

        },
        [fetchUsers]
    );

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

            <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="min-w-[900px] w-full">
                    <thead>
                        <tr className="text-left text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800">
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Username</th>

                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Status</th>
                            {/* <th className="px-4 py-3">Action</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 && !loading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                                    No ecom-users found.
                                </td>
                            </tr>
                        ) : null}

                        {users.map((u, index) => {
                            const id = index + 1;
                            const status = u.status ?? 'unknown';
                            const isUpdating = updatingId === id;

                            return (
                                <tr key={String(id)} className="border-b border-gray-100 dark:border-gray-800">
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{String(id)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {u.username || u.name || '—'}
                                    </td>

                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{u.email || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{u.phone || '—'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                                            {status ? 'Active' : 'Block | Pending'}
                                        </span>
                                    </td>

                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

