"use client";

import React, { useState, useEffect, useCallback } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import { useMilestones } from '@/hooks/useMilestones';
import { useModal } from '@/hooks/useModal';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import TextArea from '@/components/form/input/TextArea';
import Select from '@/components/form/Select';
import { Modal } from '@/components/ui/modal';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import type { Milestone, LevelCommission } from '@/types/commission-type';
import { useAuth } from '@/context/AuthContext';

export default function MilestonesTable() {
    const {
        milestones,
        loading,
        error,
        fetchMilestones,
        createMilestone,
        updateMilestone,
        deleteMilestone,
    } = useMilestones();

    const { isOpen, openModal, closeModal } = useModal();
    const [editMode, setEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState<Milestone | null>(null);
    const [levelCommissions, setLevelCommissions] = useState<LevelCommission[]>([]);
    const [fetchingLevels, setFetchingLevels] = useState(false);

    const { hasPermission } = useAuth()

    const [formData, setFormData] = useState({
        level_id: '',
        milestone_name: '',
        tour_details: '',
        reward_cash: '',
        cash_com: '',
    });

    const fetchLevelCommissions = useCallback(async () => {
        setFetchingLevels(true);
        try {
            const response = await serverCallFuction('GET', 'api/settings/commissions/list');
            if (response.success) {
                setLevelCommissions(response.data || []);
            }
        } catch {
            // silently fail
        } finally {
            setFetchingLevels(false);
        }
    }, []);

    useEffect(() => {
        fetchMilestones();
    }, [fetchMilestones]);

    const resetForm = () => {
        setFormData({
            level_id: '',
            milestone_name: '',
            tour_details: '',
            reward_cash: '',
            cash_com: ''
        });
        setEditMode(false);
        setCurrentItem(null);
    };

    const handleOpenCreate = () => {
        fetchLevelCommissions();
        resetForm();
        openModal();
    };

    const handleOpenEdit = (item: Milestone) => {
        fetchLevelCommissions();
        setEditMode(true);
        setCurrentItem(item);
        setFormData({
            level_id: item.level_id?.toString() || '',
            milestone_name: item.milestone_name,
            tour_details: item.tour_details,
            reward_cash: item.reward_cash,
            cash_com: item.cash_com
        });
        openModal();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this milestone?')) return;
        const result = await deleteMilestone(id);
        if (result.success) {
            fetchMilestones();
        }
    };

    const handleSubmit = async () => {
        if (!formData.level_id || !formData.milestone_name || !formData.tour_details || !formData.reward_cash) {
            alert('Please fill all fields');
            return;
        }

        const payload = {
            level_id: formData.level_id,
            milestone_name: formData.milestone_name,
            tour_details: formData.tour_details,
            reward_cash: formData.reward_cash,
            cash_com: formData.cash_com
        };

        let result;
        if (editMode && currentItem) {
            result = await updateMilestone(currentItem.id, payload);
        } else {
            result = await createMilestone(payload);
        }

        if (result.success) {
            closeModal();
            resetForm();
            fetchMilestones();
        } else {
            alert(result.error || 'Operation failed');
        }
    };

    const getLevelLabel = (levelId: string | number) => {
        const level = levelCommissions.find(l => l.id.toString() === levelId.toString());
        return level ? `(${level.level_no}) ${level.level_name}` : levelId;
    };

    if (loading && milestones.length === 0) {
        return <div className="p-6 text-center">Loading milestones...</div>;
    }

    const isPermitCrud = hasPermission("level-milestone")

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Level Milestones</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage milestone rewards for each level</p>
                </div>
                {isPermitCrud &&
                    <Button onClick={handleOpenCreate} startIcon={<Plus className="w-4 h-4" />}>
                        New Milestone
                    </Button>
                }
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
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Level</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Milestone Name</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Tour Details</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Reward Cash (%)</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">In Cash Com (%)</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Created At</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-right">Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {milestones.map((milestone) => (
                                <TableRow key={milestone.id}>
                                    <TableCell className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                        {milestone.level_name ? `(${milestone.level_no}) ${milestone.level_name}` : getLevelLabel(milestone.level_id)}
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                                        {milestone.milestone_name}
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                        {milestone.tour_details}
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <Badge color="success" variant="solid" size="sm">
                                            {milestone.reward_cash}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <Badge color="success" variant="solid" size="sm">
                                            {milestone.cash_com ? milestone.cash_com + "%" : "-"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {milestone.created_at ? new Date(milestone.created_at).toLocaleDateString() : '-'}
                                    </TableCell>
                                    {isPermitCrud &&
                                        <TableCell className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenEdit(milestone)}
                                                    startIcon={<Pencil className="w-4 h-4" />}
                                                >
                                                    {' '}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(milestone.id)}
                                                    startIcon={<Trash2 className="w-4 h-4" color="red" />}
                                                >
                                                    {' '}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    }
                                </TableRow>
                            ))}
                            {milestones.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-gray-500 dark:text-gray-400">
                                        No milestones found. Create one to get started.
                                    </TableCell>
                                </TableRow>
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
                        {editMode ? 'Edit Milestone' : 'New Milestone'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Label htmlFor="level_id">Level <span className="text-red-500">*</span></Label>
                            <Select
                                options={levelCommissions.map((item) => ({
                                    label: `(${item.level_no}) ${item.level_name}`,
                                    value: item.id.toString(),
                                }))}
                                placeholder={fetchingLevels ? 'Loading levels...' : 'Select Level'}
                                defaultValue={formData.level_id}
                                onChange={(value) => setFormData({ ...formData, level_id: value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="milestone_name">Milestone Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="milestone_name"
                                type="text"
                                placeholder="e.g. Goa Trip"
                                defaultValue={formData.milestone_name}
                                onChange={(e) => setFormData({ ...formData, milestone_name: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="tour_details">Tour Details <span className="text-red-500">*</span></Label>
                            <TextArea
                                placeholder="Enter tour details..."
                                rows={4}
                                value={formData.tour_details}
                                onChange={(value) => setFormData({ ...formData, tour_details: value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="reward_cash">Reward Cash (%) <span className="text-red-500">*</span></Label>
                            <Input
                                id="reward_cash"
                                type="text"
                                placeholder="e.g. 1"
                                defaultValue={formData.reward_cash}
                                onChange={(e) => setFormData({ ...formData, reward_cash: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="reward_cash">Cash Com. (%) <span className="text-red-500">*</span></Label>
                            <Input
                                id="cash_com"
                                type="text"
                                placeholder="e.g. 2"
                                defaultValue={formData.cash_com}
                                onChange={(e) => setFormData({ ...formData, cash_com: e.target.value })}
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
}

