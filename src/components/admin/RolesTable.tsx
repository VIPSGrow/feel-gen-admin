"use client";

import React, { useState, useEffect } from 'react';
import { useRoles } from '@/hooks/useRoles';
import type { Role, CreateRolePayload, UpdateRolePayload } from '@/types/role';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/modal';
import Input from '@/components/form/input/InputField'; // Assume exists, else use text field
import Label from '@/components/form/Label';
import { Trash2, Edit3, Plus, PlusIcon } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import { Modal } from '../ui/modal';

interface RolesTableProps { }

const PERMISSIONS = [
    'dashboard', 'members', 'network-tree', 'kyc-requests', 'analytics',
    'products', 'product-list', 'add-product', 'pro-category', 'attributes',
    'all-products', 'coupons', 'orders', 'distributor-orders', 'purchase',
    'commissions', 'level-capping', 'level-milestone', 'p-transactions',
    'transactions', 'withdrawals', 'gst-tds', 'reports', 'settings',
    'staff', 'roles', 'staffs', 'cms', 'static-content', 'state-city',
    'team-member', 'nofications', 'wallet', 'referral', 'simulator', 'ranks'
] as const;

export default function RolesTable({ }: RolesTableProps) {
    const { roles, loading, error, fetchRoles, createRole, updateRole, deleteRole } = useRoles();
    const [open, setOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', permissions: [] as string[] });

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleSubmit = async () => {
        if (editingRole) {
            const result = await updateRole(editingRole.id, formData as UpdateRolePayload);
            if (result.success) setOpen(false);
        } else {
            const result = await createRole(formData as CreateRolePayload);
            if (result.success) setOpen(false);
        }
        setFormData({ name: '', description: '', permissions: [] });
        setEditingRole(null);
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setFormData({ name: role.name, description: role.description || '', permissions: role.permissions || [] });
        setOpen(true);
    };

    const handleDelete = async (id: string | number) => {
        if (confirm('Are you sure?')) {
            const result = await deleteRole(id);
            if (result.success) {
                // Success handled in hook
            }
        }
    };

    const openCreateModal = () => {
        setEditingRole(null);
        setFormData({ name: '', description: '', permissions: [] });
        setOpen(true);
    };

    const handlePermissionChange = (permission: string, checked: boolean) => {
        const newPermissions = checked
            ? [...formData.permissions, permission]
            : formData.permissions.filter(p => p !== permission);
        setFormData({ ...formData, permissions: newPermissions });
    };

    if (loading) return <div className="p-8 text-center">Loading roles...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    return (
        <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Roles Management
                    </h1>
                    <p className="text-muted-foreground dark:text-gray-300">
                        Manage roles of your staff
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">

                    <Button
                        onClick={openCreateModal}
                        startIcon={<PlusIcon />}>
                        Add Role
                    </Button>
                </div>
            </div>

            {/* <div className="flex justify-between items-center"> */}

            <Modal isOpen={open}
                onClose={() => {
                    setOpen(false)
                }}
                className='max-w-6xl mx-auto'>
                <div className="p-6">
                    <h2 className="text-lg font-bold mb-6">
                        {editingRole ? 'Edit Role' : 'Create Role'}
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                defaultValue={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter role name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                defaultValue={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter description (optional)"
                            />
                        </div>
                        <div>
                            <Label>Permissions</Label>
                            <div className="max-h-70 overflow-y-auto p-2 border rounded-md bg-gray-50 dark:bg-gray-800">
                                <div className="grid grid-cols-4 gap-2">
                                    {PERMISSIONS.map((permission) => (
                                        <label key={permission} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.includes(permission)}
                                                onChange={(e) => {
                                                    const newPermissions = e.target.checked
                                                        ? [...formData.permissions, permission]
                                                        : formData.permissions.filter(p => p !== permission);
                                                    setFormData({ ...formData, permissions: newPermissions });
                                                }}
                                                className="rounded"
                                            />
                                            <span className="text-sm">{permission}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {formData.permissions.length > 0 && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Selected: {formData.permissions.length} permissions
                                </p>
                            )}
                        </div>
                    </div>

                    <div className='flex mt-4 gap-4 justify-end'>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>Save</Button>
                    </div>
                </div>




            </Modal>
            {/* </div> */}
            <div className="rounded-xl border bg-card overflow-hidden bg-white dark:bg-gray-900">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Name</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Description</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Permissions</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-right">Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {roles.map((role, index) => (
                                <TableRow key={index}>
                                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">{role.name}</TableCell>
                                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{role.description || '-'}</TableCell>
                                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {role.permissions ? (
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions.map((p, i) => (
                                                    <Badge key={i} size="sm" variant="light" color='primary'>
                                                        {p}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 text-right ">
                                        <div className="flex gap-2 justify-end">
                                            {role.name !== "super_admin" &&
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(role)}
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDelete(role.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" color='red' />
                                                    </Button>
                                                </>}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {roles.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No roles found. Create one above.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

