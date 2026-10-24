"use client";
import React, { useState, useEffect, useCallback } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Input from '@/components/form/input/InputField';
import { useModal } from '@/hooks/useModal';
import { Modal } from '@/components/ui/modal';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import { ResponsiveTable, Column } from '@/components/tables/ResponsiveTable';
import type { LevelCommission } from '@/types/commission-type';
import { useAuth } from '@/context/AuthContext';

// interface removed, using imported type

const RANKS = ['Distributor', 'Silver', 'Gold', 'Platinum', 'Diamond'] as const;

const LevelCommissionComponent = () => {
  const { hasPermission } = useAuth()
  const [commissions, setCommissions] = useState<LevelCommission[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const { isOpen, openModal, closeModal } = useModal();
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<LevelCommission | null>(null);

  const [formData, setFormData] = useState({
    level_no: '',
    type: '',
    level_name: '',
    commission_percentage: '',
    team_size_threshold: 0,
  });

  const fetchCommissions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await serverCallFuction('GET', 'api/settings/commissions/list');
      if (response.success) {
        setCommissions(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch');
      }
    } catch (err) {
      setError('Error fetching commissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommissions();
  }, [refreshKey, fetchCommissions]);

  const resetForm = () => {
    setFormData({
      level_no: '',
      type: '',
      level_name: '',
      commission_percentage: '',
      team_size_threshold: 0,
    });
    setEditMode(false);
    setCurrentItem(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    openModal();
  };

  const handleOpenEdit = (item: LevelCommission) => {
    setEditMode(true);
    setCurrentItem(item);
    setFormData({
      level_no: item.level_no.toString(),
      type: item.type,
      level_name: item.level_name,
      commission_percentage: item.commission_percentage.toString(),
      team_size_threshold: item.team_size_threshold,
    });
    openModal();
  };

  const handleDelete = async (id: number, level_no: number) => {
    if (!confirm('Are you sure you want to delete this level?')) return;
    try {
      const response = await serverCallFuction('DELETE', `api/settings/level-commissions/${level_no}`);
      if (response.success) {
        alert('Deleted successfully');
        setRefreshKey(prev => prev + 1);
      } else {
        alert(response.message || 'Delete failed');
      }
    } catch (err) {
      alert('Error deleting');
    }
  };

  const handleSubmit = async () => {
    if (!formData.level_no || !formData.commission_percentage) {
      alert('Please fill all fields');
      return;
    }
    try {
      let response;
      if (editMode && currentItem) {
        response = await serverCallFuction('PUT', `api/settings/level-commissions/${currentItem.level_no}`, formData);
      } else {
        response = await serverCallFuction('POST', 'api/settings/level-commissions', formData);
      }
      if (response.success) {
        alert('Saved successfully');
        closeModal();
        setRefreshKey(prev => prev + 1);
      } else {
        alert(response.message || 'Save failed');
      }
    } catch (err) {
      alert('Error saving');
    }
  };

  const commissionColumns: Column<LevelCommission>[] = [
    { header: 'Level No', cell: (c) => <span className="font-semibold text-gray-900 dark:text-white">{c.level_no}</span> },
    {
      header: 'Type',
      cell: (c) => (
        <Badge color="primary" variant="solid" size="sm">
          {c.type}
        </Badge>
      ),
    },
    { header: 'Level Name', cell: (c) => <span className="font-semibold text-gray-900 dark:text-white">{c.level_name}</span> },
    { header: 'Commission %', cell: (c) => <span className="font-semibold text-emerald-600">{c.commission_percentage}%</span> },
    { header: 'Team Size Threshold', cell: (c) => c.team_size_threshold ?? '-' },
    ...(hasPermission('commissions/add')
      ? [
          {
            header: 'Actions',
            cell: (c: LevelCommission) => (
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(c)} startIcon={<Pencil className="w-4 h-4" />}>
                  {null}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(c.level_no, c.level_no)} startIcon={<Trash2 className="w-4 h-4" color="red" />}>
                  {null}
                </Button>
              </div>
            ),
          } as Column<LevelCommission>,
        ]
      : []),
  ];

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Level Commissions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage level commission structure</p>
        </div>
        {hasPermission('commissions/add') &&
          <Button onClick={handleOpenCreate} startIcon={<Plus className="w-4 h-4" />}>
            New Level
          </Button>
        }
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <ResponsiveTable<LevelCommission>
          columns={commissionColumns}
          data={commissions}
          keyExtractor={(c) => `${c.type}-${c.level_no}`}
          emptyText="No commissions found."
        />
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => {
        closeModal();
        resetForm();
      }}
        className='w-xl'
      >
        <div className="p-6 md:p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editMode ? 'Edit Level Commission' : 'New Level Commission'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level No</label>
              <Input
                type="number"
                placeholder="e.g. 8"
                defaultValue={formData.level_no}
                onChange={(e) => setFormData({ ...formData, level_no: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level Name</label>
              <Input
                type="text"
                placeholder="e.g. 8"
                defaultValue={formData.level_name}
                onChange={(e) => setFormData({ ...formData, level_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <Input
                type="text"
                placeholder="e.g. generation"
                defaultValue={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Commission Percentage</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="e.g. 5.5"
                defaultValue={formData.commission_percentage}
                onChange={(e) => setFormData({ ...formData, commission_percentage: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team Size Threshold</label>
              <Input
                type="number"
                step="1"
                min="0"
                placeholder="e.g. 10"
                defaultValue={formData.team_size_threshold}
                onChange={(e) => setFormData({ ...formData, team_size_threshold: e.target.value })}
              />
            </div>


          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => {
              closeModal();
              resetForm();
            }}>
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

export default LevelCommissionComponent;

