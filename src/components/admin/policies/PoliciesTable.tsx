"use client";

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import serverCallFuction from '@/lib/constantFunction';
import { downloadFile } from '@/lib/constantFunction';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Badge from '@/components/ui/badge/Badge';
import { Modal } from '@/components/ui/modal';



type Policy = {
    id: number | string;
    title: string;
    version?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
};

type PoliciesResponse = {
    status: boolean;
    success?: boolean;
    message?: string;
    data?: Policy[];
};

const canCrud = (hasPermission: (p: string) => boolean) =>
    hasPermission('policies') && hasPermission('policies:edit');

const canRead = (hasPermission: (p: string) => boolean) => hasPermission('policies');

export default function PoliciesTable() {
    const { user, hasPermission } = useAuth();

    const [loading, setLoading] = useState(true);
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [search, setSearch] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

    const canView = useMemo(() => canRead(hasPermission), [hasPermission]);
    const canDownload = useMemo(() => hasPermission('policies:download') || canView, [hasPermission, canView]);
    const canCreateOrEdit = useMemo(() => hasPermission('policies:add') || hasPermission('policies:edit'), [hasPermission]);
    const canDelete = useMemo(() => hasPermission('policies:delete') || (canCreateOrEdit && hasPermission('policies:edit')), [hasPermission, canCreateOrEdit]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return policies;
        return policies.filter((p) => {
            return (
                (p.title || '').toLowerCase().includes(q) ||
                (p.version || '').toLowerCase().includes(q) ||
                String(p.id).toLowerCase().includes(q)
            );
        });
    }, [policies, search]);

    useEffect(() => {
        if (!canView) return;

        const fetchPolicies = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await serverCallFuction('GET', 'api/policies');
                const data = (res as PoliciesResponse)?.data || [];
                setPolicies(data);
            } catch (e: any) {
                setError(e?.message || 'Failed to load policies');
            } finally {
                setLoading(false);
            }
        };

        fetchPolicies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canView]);

    const openCreate = () => {
        setEditingPolicy(null);
        setIsFormOpen(true);
    };

    const openEdit = (p: Policy) => {
        setEditingPolicy(p);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: Policy['id']) => {
        if (!confirm('Delete this policy?')) return;

        try {
            const res = await serverCallFuction('DELETE', `api/policies/${id}`);
            const resp = res as unknown as { status?: boolean; message?: string };

            if (resp?.success) {
                setPolicies((prev) => prev.filter((p) => p.id !== id));
            } else {
                alert(resp?.message || 'Delete failed');
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Delete failed';
            alert(msg);
        }
    };


    const handleView = (p: Policy) => {
        if (p.file_url) { // या जो भी आपका की (key) नाम हो
            window.open(p.file_url, '_blank', 'noopener,noreferrer');
        } else {
            console.warn("No URL found for this policy");
        }
    };

    const handleDownload = async (p: Policy) => {
        const blobRes = await downloadFile('GET', `api/policies/${p.id}/download`);
        const maybeResp = blobRes as unknown;
        if (
            typeof maybeResp === 'object' &&
            maybeResp !== null &&
            'status' in (maybeResp as any) &&
            (maybeResp as any).status === false
        ) {
            alert((maybeResp as any).message || 'Download failed');
            return;
        }

        const blob = blobRes as Blob;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${p.title || 'policy'}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };


    if (!canView) {
        return <div className="p-8 text-center">Access denied.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Policies</h1>
                    <p className="text-gray-500 dark:text-gray-400">View and manage policy documents</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        placeholder="Search by title/version/id..."
                        defaultValue={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-md"
                    />

                    {canCreateOrEdit && (
                        <Button onClick={openCreate}>
                            Add Policy
                        </Button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <p>Loading policies...</p>
                </div>
            ) : error ? (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
                    {error}
                </div>
            ) : (
                <div className="rounded-xl border bg-card overflow-hidden bg-white dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">
                                        Title
                                    </TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">
                                        Version
                                    </TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">
                                        Status
                                    </TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">
                                        Updated
                                    </TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-right">
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {filtered.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                                            {p.title}
                                            <p className="text-sm text-gray-500">#{p.id}</p>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{p.version || '-'}</TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            <Badge>{(p.is_active ?? true) ? 'ACTIVE' : 'INACTIVE'}</Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {p.updated_at ? new Date(p.updated_at).toLocaleDateString('en-GB') : '-'}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline" onClick={() => handleView(p)}>
                                                    View
                                                </Button>
                                                {/* {canDownload && (
                                                    <Button size="sm" variant="outline" onClick={() => handleDownload(p)}>
                                                        Download
                                                    </Button>
                                                )} */}
                                                {canCreateOrEdit && (
                                                    <>
                                                        <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                                                            Edit
                                                        </Button>
                                                    </>
                                                )}
                                                {canDelete && (
                                                    <Button size="sm" variant="outline" onClick={() => handleDelete(p.id)}>
                                                        Delete
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 h-32">
                                            No policies found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {isFormOpen && (
                <PolicyModal
                    isOpen={isFormOpen}
                    policy={editingPolicy}
                    canCrud={canCreateOrEdit}
                    canDelete={canDelete}
                    onClose={() => setIsFormOpen(false)}
                    onSaved={(saved) => {
                        if (editingPolicy) {
                            setPolicies((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
                        } else {
                            setPolicies((prev) => [saved, ...prev]);
                        }
                    }}
                />
            )}
        </div>
    );
}

function PolicyModal({
    isOpen,
    policy,
    canCrud,
    onClose,
    onSaved,
}: {
    isOpen: boolean;
    policy: Policy | null;
    canCrud: boolean;
    canDelete: boolean;
    onClose: () => void;
    onSaved: (p: Policy) => void;
}) {
    const { hasPermission } = useAuth();

    const [title, setTitle] = useState(policy?.title || '');
    const [version, setVersion] = useState(policy?.version || '');
    const [isActive, setIsActive] = useState<boolean>((policy?.is_active ?? true) as boolean);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setTitle(policy?.title || '');
        setVersion(policy?.version || '');
        setIsActive((policy?.is_active ?? true) as boolean);
        setPdfFile(null);
        setError(null);
    }, [isOpen, policy]);

    const isEdit = !!policy;

    const handleSubmit = async () => {
        if (!canCrud) return;

        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        if (!isEdit && !pdfFile) {
            setError('PDF is required for creating a policy');
            return;
        }

        setSubmitLoading(true);
        setError(null);

        try {
            const fd = new FormData();
            fd.append('title', title.trim());
            if (version.trim()) fd.append('version', version.trim());
            fd.append('is_active', String(isActive));
            if (pdfFile) fd.append('pdf', pdfFile);

            const res = isEdit
                ? await serverCallFuction('PUT', `api/policies/${policy!.id}`, fd)
                : await serverCallFuction('POST', 'api/policies', fd);

            const r = res as unknown as { data?: Policy | null; success?: boolean; message?: string };
            const saved = r.data as Policy;
            if (r.success === false || !saved) {
                setError(r.message || 'Save failed');

                return;
            }

            onSaved(saved);
            onClose();
        } catch (e: any) {
            setError(e?.message || 'Save failed');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold">{isEdit ? 'View / Edit Policy' : 'Create Policy'}</h2>
                        <p className="text-sm text-gray-500">{canCrud ? 'CRUD allowed for super admin' : 'Distributor read-only'}</p>
                    </div>
                    <div>
                        {policy && <Badge>{policy.is_active ?? true ? 'ACTIVE' : 'INACTIVE'}</Badge>}
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={!canCrud} />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Version</label>
                        <Input value={version} onChange={(e) => setVersion(e.target.value)} disabled={!canCrud} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={!canCrud}
                                onClick={() => setIsActive(true)}
                                className={
                                    isActive
                                        ? 'flex-1 h-11 px-4 text-sm font-medium rounded-xl border border-gray-900 bg-gray-900 text-white'
                                        : 'flex-1 h-11 px-4 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-700'
                                }
                            >
                                Active
                            </button>
                            <button
                                type="button"
                                disabled={!canCrud}
                                onClick={() => setIsActive(false)}
                                className={
                                    !isActive
                                        ? 'flex-1 h-11 px-4 text-sm font-medium rounded-xl border border-gray-900 bg-gray-900 text-white'
                                        : 'flex-1 h-11 px-4 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-700'
                                }
                            >
                                Inactive
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                            PDF {isEdit ? '(optional - leave empty to keep old)' : '(required)'}
                        </label>
                        <input
                            type="file"
                            accept="application/pdf"
                            disabled={!canCrud}
                            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    {canCrud && (
                        <Button onClick={handleSubmit} disabled={submitLoading}>
                            {submitLoading ? 'Saving...' : 'Save'}
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
}

