"use client"
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import serverCallFuction from '@/lib/constantFunction';
import { formatDate } from '@fullcalendar/core/index.js';
import React, { useCallback, useEffect, useState } from 'react'
import Input from '@/components/form/input/InputField';
import { useModal } from '@/hooks/useModal';
import { LevelCapping, LevelCommission } from '@/types/commission-type';
import { Modal } from '@/components/ui/modal';
import Select from '@/components/form/Select';

const LevelCapping = () => {
    const [commissions, setCommissions] = useState<LevelCapping[]>([]);
    const [levelCommissions, setLevelCommissions] = useState<LevelCommission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    const { isOpen, openModal, closeModal } = useModal();
    const [editMode, setEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState<LevelCapping | null>(null);
    const [formData, setFormData] = useState({
        id: '',
        level_id: '',
        day_limit: '',
        week_limit: '',
        monthly_limit: ''
    });

    const fetchLevelCommissions = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await serverCallFuction('GET', 'api/settings/commissions/list');
            if (response.success) {
                setLevelCommissions(response.data || []);
            } else {
                setError(response.message || 'Failed to fetch');
            }
        } catch (err) {
            setError('Error fetching commissions');
        } finally {
            setLoading(false);
        }
    }, []);


    const fetchCommissions = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await serverCallFuction('GET', 'api/settings/capping/list');
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
            id: '',
            level_id: '',
            week_limit: '',
            monthly_limit: ''
        });
        setEditMode(false);
        setCurrentItem(null);
    };

    const handleSubmit = async () => {
        if (!formData.level_id || !formData.week_limit || !formData.monthly_limit) {
            alert('Please fill all fields');
            return;
        }
        try {
            let response;
            if (editMode && currentItem) {
                response = await serverCallFuction('PUT', `api/settings/level-capping/${currentItem.id}`, formData);
            } else {
                response = await serverCallFuction('POST', 'api/settings/level-capping', formData);
            }
            if (response.success) {
                alert('Saved successfully');
                closeModal();
                setRefreshKey(prev => prev + 1);
            } else {
                alert(response.message || 'Save failed');
            }

        } catch (error) {
            console.log("level capp creating error - ", error);

        }
    }

    const handleOpenCreate = () => {
        fetchLevelCommissions();
        resetForm();
        openModal();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this level-cap?')) return;
        try {
            const response = await serverCallFuction('DELETE', `api/settings/level-capping/${id}`);
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


    const handleOpenEdit = (item: LevelCapping) => {
        fetchLevelCommissions();
        setEditMode(true);
        setCurrentItem(item);
        setFormData({
            level_id: item.level_id,            
            day_limit:item.day_limit,
            week_limit: item.week_limit,
            monthly_limit: item.monthly_limit
        });
        openModal();
    };

    return (
        <>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Level Capping</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage level capping structure</p>
                    </div>
                    <Button onClick={handleOpenCreate} startIcon={<Plus className="w-4 h-4" />}>
                        New Cap
                    </Button>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
                        {error}
                    </div>
                )}


                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="min-w-[800px] overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Level Name</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Day Limit</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Week Limit</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Monthly Limit</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Created At</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-right">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {commissions.map((commission) => (
                                    <TableRow key={commission.id}>
                                        <TableCell className="px-6 py-4 font-semibold text-gray-900 dark:text-white">({commission.level_no}) - {commission.level_name}</TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge color='success' variant='solid'>
                                                {commission.day_limit}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge color='success' variant='solid'>
                                                {commission.week_limit}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 font-semibold text-emerald-600">
                                            <Badge color='success' variant='solid'>
                                                {commission.monthly_limit}
                                            </Badge></TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{formatDate(commission.created_at)}</TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenEdit(commission)}
                                                    startIcon={<Pencil className="w-4 h-4" />}
                                                > </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"

                                                    onClick={() => handleDelete(commission.id)}
                                                    startIcon={<Trash2 className="w-4 h-4" color='red' />}
                                                > </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>


                {/* Modal */}
                <Modal isOpen={isOpen} onClose={() => {
                    closeModal();
                    resetForm();
                }}
                    className='w-lg'
                >
                    <div className="p-6 md:p-8 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {editMode ? 'Edit Level Commission' : 'New Level Commission'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level Id</label>
                                {/* <Input
                                    type="number"
                                    placeholder="e.g. 8"
                                    defaultValue={formData.level_id}
                                    onChange={(e) => setFormData({ ...formData, level_id: e.target.value })}
                                /> */}
                                <Select options={
                                    levelCommissions.map((item) => {
                                        return { label: item.level_name, value: item.id }
                                    })
                                } placeholder='Select Level Commission'
                                    onChange={(e) => {
                                        setFormData({ ...formData, level_id: e })
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Day Limit</label>
                                <Input
                                    type="text"
                                    placeholder="e.g. 8"
                                    defaultValue={formData.day_limit}
                                    onChange={(e) => setFormData({ ...formData, day_limit: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Week Limit</label>
                                <Input
                                    type="text"
                                    placeholder="e.g. 8"
                                    defaultValue={formData.week_limit}
                                    onChange={(e) => setFormData({ ...formData, week_limit: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Limit</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="e.g. 5.5"
                                    defaultValue={formData.monthly_limit}
                                    onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
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
        </>
    )
}

export default LevelCapping
