"use client";
import React, { useState, useEffect, useCallback } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Switch from '@/components/form/switch/Switch';
import { useModal } from '@/hooks/useModal';
import { Modal } from '@/components/ui/modal';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table/index';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import type { Tax } from '@/types/tax';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const TaxSettingPage = () => {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const { isOpen, openModal, closeModal } = useModal();
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Tax | null>(null);

  const [formData, setFormData] = useState({
    tax_name: '',
    tax_percentage: '',
    state_code: '',
    country_code: '',
    is_inclusive: false,
    status: 'active',
  });

  const fetchTaxes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await serverCallFuction('GET', 'api/tax');
      if (response.success) {
        setTaxes(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch taxes');
      }
    } catch (err) {
      setError('Error fetching taxes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTaxes();
  }, [refreshKey, fetchTaxes]);

  const resetForm = () => {
    setFormData({
      tax_name: '',
      tax_percentage: '',
      state_code: '',
      country_code: '',
      is_inclusive: false,
      status: 'active',
    });
    setEditMode(false);
    setCurrentItem(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    openModal();
  };

  const handleOpenEdit = (item: Tax) => {
    setEditMode(true);
    setCurrentItem(item);
    setFormData({
      tax_name: item.tax_name,
      tax_percentage: item.tax_percentage,
      state_code: item.state_code,
      country_code: item.country_code,
      is_inclusive: item.is_inclusive,
      status: item.status,
    });
    openModal();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tax?')) return;
    try {
      const response = await serverCallFuction('DELETE', `api/tax/${id}`);
      if (response.success) {
        alert('Deleted successfully');
        setRefreshKey((prev) => prev + 1);
      } else {
        alert(response.message || 'Delete failed');
      }
    } catch (err) {
      alert('Error deleting tax');
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.tax_name ||
      !formData.tax_percentage ||
      !formData.state_code ||
      !formData.country_code
    ) {
      alert('Please fill all required fields');
      return;
    }

    try {
      let response;
      if (editMode && currentItem) {
        response = await serverCallFuction(
          'PUT',
          `api/tax/${currentItem.id}`,
          formData
        );
      } else {
        response = await serverCallFuction('POST', 'api/tax', formData);
      }
      if (response.success) {
        alert(editMode ? 'Updated successfully' : 'Created successfully');
        closeModal();
        resetForm();
        setRefreshKey((prev) => prev + 1);
      } else {
        alert(response.message || 'Save failed');
      }
    } catch (err) {
      alert('Error saving tax');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tax Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage tax configurations for your application
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          startIcon={<Plus className="w-4 h-4" />}
        >
          Add Tax
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="min-w-[900px] overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left"
                >
                  Tax Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left"
                >
                  Percentage
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left"
                >
                  State Code
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left"
                >
                  Country Code
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left"
                >
                  Inclusive
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left"
                >
                  Created At
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-right"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No taxes found. Click "Add Tax" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                taxes.map((tax) => (
                  <TableRow key={tax.id}>
                    <TableCell className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {tax.tax_name}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-emerald-600 font-semibold">
                      {tax.tax_percentage}%
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {tax.state_code}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {tax.country_code}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        color={tax.is_inclusive ? 'success' : 'dark'}
                        variant="solid"
                        size="sm"
                      >
                        {tax.is_inclusive ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        color={tax.status === 'active' ? 'success' : 'error'}
                        variant="solid"
                        size="sm"
                      >
                        {tax.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {formatDate(tax.created_at)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(tax)}
                          startIcon={<Pencil className="w-4 h-4" />}
                        >
                          {null}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tax.id)}
                          startIcon={<Trash2 className="w-4 h-4" color="red" />}
                        >
                          {null}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          closeModal();
          resetForm();
        }}
        className="w-lg"
      >
        <div className="p-6 md:p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editMode ? 'Edit Tax' : 'Add Tax'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tax Name */}
            <div>
              <Label>Tax Name</Label>
              <Input
                type="text"
                placeholder="e.g. GST"
                defaultValue={formData.tax_name}
                onChange={(e) =>
                  setFormData({ ...formData, tax_name: e.target.value })
                }
              />
            </div>

            {/* Tax Percentage */}
            <div>
              <Label>Tax Percentage</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="e.g. 18"
                defaultValue={formData.tax_percentage}
                onChange={(e) =>
                  setFormData({ ...formData, tax_percentage: e.target.value })
                }
              />
            </div>

            {/* State Code */}
            <div>
              <Label>State Code</Label>
              <Input
                type="text"
                placeholder="e.g. MH"
                defaultValue={formData.state_code}
                onChange={(e) =>
                  setFormData({ ...formData, state_code: e.target.value })
                }
              />
            </div>

            {/* Country Code */}
            <div>
              <Label>Country Code</Label>
              <Input
                type="text"
                placeholder="e.g. IN"
                defaultValue={formData.country_code}
                onChange={(e) =>
                  setFormData({ ...formData, country_code: e.target.value })
                }
              />
            </div>

            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select
                options={STATUS_OPTIONS}
                placeholder="Select status"
                defaultValue={formData.status}
                onChange={(value) =>
                  setFormData({ ...formData, status: value as 'active' | 'inactive' })
                }
              />
            </div>

            {/* Is Inclusive */}
            <div className="flex items-end pb-2">
              <Switch
                label="Is Inclusive"
                defaultChecked={formData.is_inclusive}
                onChange={(checked) =>
                  setFormData({ ...formData, is_inclusive: checked })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                closeModal();
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} startIcon={<Save className="w-4 h-4" />}>
              {editMode ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaxSettingPage;

