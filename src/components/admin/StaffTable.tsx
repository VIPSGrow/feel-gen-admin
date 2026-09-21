"use client";

import React, { useState, useEffect } from 'react';
import { useStaff } from '@/hooks/useStaff';
import { useRoles } from '@/hooks/useRoles';
import type { Staff, CreateStaffPayload, UpdateStaffPayload } from '@/types/staff';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
} from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { Trash2, Edit3, Plus, PlusIcon } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import { Modal } from '../ui/modal';
import { date_formate, formattedAmount } from '@/lib/constantFunction';
import { useAuth } from '@/context/AuthContext';

const StaffTable = () => {
  const { staffs, loading, error, createStaff, updateStaff, deleteStaff } = useStaff();
  const { roles, fetchRoles } = useRoles();

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);
  const [open, setOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<CreateStaffPayload>({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role_id: 0,
    department: '',
    designation: '',
    salary: 0,
    hire_date: '',
    manager_id: undefined,
  });

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      role_id: 0,
      department: '',
      designation: '',
      salary: 0,
      hire_date: '',
      manager_id: undefined,
    });
    setEditingStaff(null);
  };

  const handleSubmit = async () => {

    console.log("Handle 1. = ", formData, editingStaff);
    if (formData.role_id === undefined || formData.role_id === null) return;

    console.log("Handle = ", editingStaff);

    if (editingStaff) {
      console.log("Handle submit edit - ", editingStaff);
      const result = await updateStaff(editingStaff.id, formData as UpdateStaffPayload);
      if (result.success) {
        setOpen(false);
        resetForm();
      }
    } else {
      const result = await createStaff(formData);
      if (result.success) {
        setOpen(false);
        resetForm();
      }
    }
  };

  const handleEdit = (staffItem: Staff) => {
    setEditingStaff(staffItem);
    setFormData({
      full_name: staffItem.full_name,
      email: staffItem.email,
      phone: staffItem.phone,
      password: '',
      role_id: staffItem.role_id,
      department: staffItem.department,
      designation: staffItem.designation,
      salary: staffItem.salary,
      hire_date: staffItem.hire_date,
      manager_id: staffItem.manager_id || undefined,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this staff?')) {
      const result = await deleteStaff(id);
      if (result.success) {
        // Success toast or message if available
      }
    }
  };

  const openCreateModal = () => {
    resetForm();
    setOpen(true);
  };

  if (loading) return <div className="p-8 text-center">Loading staffs...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Staff Management
            </h1>
            <p className="text-muted-foreground dark:text-gray-300">
              Manage your staff members
            </p>
          </div>
          <Button onClick={openCreateModal} startIcon={<PlusIcon />}>
            Add Staff
          </Button>
        </div>


        <div className="rounded-xl border bg-card overflow-hidden bg-white dark:bg-gray-900">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Name</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Email</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Phone</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Designation</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Department</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Salary</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Hire Date</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Role</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {staffs.map((staffItem) => (
                  <TableRow key={staffItem.id}>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                      <div>{staffItem.full_name}</div>
                      <Badge size='sm'>{staffItem.is_active === true ? 'Active' : 'Block'}</Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{staffItem.email}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{staffItem.phone}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{staffItem.designation}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{staffItem.department}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{formattedAmount(staffItem.salary)}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{date_formate(staffItem.hire_date)}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <Badge>{staffItem?.role_name?.toUpperCase() || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(staffItem)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(staffItem.id)}
                        >
                          <Trash2 className="w-4 h-4" color="red" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {staffs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No staff found. Add one above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <Modal isOpen={open} onClose={() => setOpen(false)} className="max-w-2xl">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">
              {editingStaff ? `Edit ${editingStaff.full_name}` : 'Create Staff'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  defaultValue={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  defaultValue={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone"
                />
              </div>
              <div>
                <Label htmlFor="role_id">Role</Label>
                <select
                  id="role_id"
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value={0}>Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  defaultValue={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Enter department"
                />
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  defaultValue={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Enter designation"
                />
              </div>
              <div>
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  defaultValue={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter salary"
                />
              </div>
              <div>
                <Label htmlFor="hire_date">Hire Date</Label>
                <Input
                  id="hire_date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  defaultValue={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="password">Password {editingStaff && '(Leave blank to keep current)'}</Label>
                <Input
                  id="password"
                  type="password"
                  defaultValue={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="manager_id">Manager ID (Optional)</Label>
                <Input
                  id="manager_id"
                  type="number"
                  defaultValue={formData.manager_id || ''}
                  onChange={(e) => setFormData({ ...formData, manager_id: parseInt(e.target.value) || undefined })}
                  placeholder="Enter manager ID"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Saving...' : editingStaff ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default StaffTable;

