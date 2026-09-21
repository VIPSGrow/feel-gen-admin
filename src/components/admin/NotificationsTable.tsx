"use client";

import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/context/AuthContext';
import type { Notification, CreateNotificationPayload } from '@/types/notifications';
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
import TextArea from '@/components/form/input/TextArea';
import Select from '@/components/form/Select';
import Badge from '@/components/ui/badge/Badge';
import { Modal } from '@/components/ui/modal';
import { Trash2, Eye, PlusIcon, Bell } from 'lucide-react';
import { date_formate } from '@/lib/constantFunction';

const DISPLAY_TYPES = [
  { value: 'BAR', label: 'Bar' },
  { value: 'POPUP', label: 'Popup' }
];

const TARGET_ROLES = [
  { value: 'all', label: 'All' },
  { value: 'admin', label: 'Admin' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'staff', label: 'Staff' },
  { value: 'member', label: 'Member' },
  { value: 'website', label: 'Website' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
];

const NotificationsTable = () => {
  const { user } = useAuth();
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    getNotificationById,
    createNotification,
    deleteNotification,
  } = useNotifications();

  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);

  const [formData, setFormData] = useState<CreateNotificationPayload>({
    sender_id: user?.id || '',
    title: '',
    message: '',
    image_url: '',
    display_type: '',
    target_role: '',
    target_id: '',
    priority: '',
  });

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const resetForm = () => {
    setFormData({
      sender_id: user?.id || '',
      title: '',
      message: '',
      image_url: '',
      display_type: '',
      target_role: '',
      target_id: '',
      priority: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.message || !formData.display_type || !formData.target_role || !formData.priority) {
      alert('Please fill in all required fields');
      return;
    }

    const payload: CreateNotificationPayload = {
      ...formData,
      target_id: formData.target_id ? Number(formData.target_id) : null,
    };

    const result = await createNotification(payload);
    if (result.success) {
      setCreateOpen(false);
      resetForm();
    }
  };

  const handleDelete = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      const result = await deleteNotification(id);
      if (result.success) {
        // success handled in hook
      }
    }
  };

  const handleView = async (id: string | number) => {
    const data = await getNotificationById(id);
    if (data) {
      setViewingNotification(data);
      setViewOpen(true);
    }
  };

  const getPriorityColor = (priority: string): "primary" | "success" | "error" | "warning" | "info" | "light" | "dark" => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'normal':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'primary';
    }
  };

  if (loading && notifications.length === 0) return <div className="p-8 text-center">Loading notifications...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Notifications
            </h1>
            <p className="text-muted-foreground dark:text-gray-300">
              Manage and send notifications to users
            </p>
          </div>
          <Button onClick={() => { resetForm(); setCreateOpen(true); }} startIcon={<PlusIcon />}>
            Send Notification
          </Button>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden bg-white dark:bg-gray-900">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Title</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Message</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Display</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Target</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Priority</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Date</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {notifications.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">{item.title}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">{item.message}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <Badge size="sm" variant="light" color="primary">{item.display_type}</Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <Badge size="sm" variant="light" color="info">{item.target_role}</Badge>
                      {item.target_id && (
                        <span className="ml-1 text-xs text-gray-400">(ID: {item.target_id})</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <Badge size="sm" variant="light" color={getPriorityColor(item.priority)}>{item.priority}</Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {item.created_at ? date_formate(item.created_at) : '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleView(item.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4" color="red" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {notifications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No notifications found. Send one above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Create Modal */}
        <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} className="max-w-3xl">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-brand-500" />
              <h2 className="text-xl font-bold">Send Notification</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sender_id">Sender ID</Label>
                <Input
                  id="sender_id"
                  type="text"
                  defaultValue={formData.sender_id}
                  onChange={(e) => setFormData({ ...formData, sender_id: e.target.value })}
                  placeholder="Enter sender ID"
                />
              </div>
              <div>
                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  type="text"
                  defaultValue={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter title"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
                <TextArea
                  placeholder="Enter message"
                  value={formData.message}
                  onChange={(value) => setFormData({ ...formData, message: value })}
                  rows={4}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="text"
                  defaultValue={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.png"
                />
              </div>
              <div>
                <Label htmlFor="display_type">Display Type <span className="text-red-500">*</span></Label>
                <Select
                  options={DISPLAY_TYPES}
                  placeholder="Select display type"
                  defaultValue={formData.display_type}
                  onChange={(value) => setFormData({ ...formData, display_type: value })}
                />
              </div>
              <div>
                <Label htmlFor="target_role">Target Role <span className="text-red-500">*</span></Label>
                <Select
                  options={TARGET_ROLES}
                  placeholder="Select target role"
                  defaultValue={formData.target_role}
                  onChange={(value) => setFormData({ ...formData, target_role: value })}
                />
              </div>
              <div>
                <Label htmlFor="target_id">Target ID (Optional)</Label>
                <Input
                  id="target_id"
                  type="number"
                  defaultValue={formData.target_id || ''}
                  onChange={(e) => setFormData({ ...formData, target_id: e.target.value })}
                  placeholder="Specific user ID"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority <span className="text-red-500">*</span></Label>
                <Select
                  options={PRIORITIES}
                  placeholder="Select priority"
                  defaultValue={formData.priority}
                  onChange={(value) => setFormData({ ...formData, priority: value.toUpperCase() })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Sending...' : 'Send Notification'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* View Modal */}
        <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} className="max-w-xl">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Notification Details</h2>
            {viewingNotification ? (
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Title</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{viewingNotification.title}</span>
                </div>
                <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Message</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 max-w-xs text-right">{viewingNotification.message}</span>
                </div>
                <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Display Type</span>
                  <Badge size="sm" variant="light" color="primary">{viewingNotification.display_type}</Badge>
                </div>
                <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Target Role</span>
                  <Badge size="sm" variant="light" color="info">{viewingNotification.target_role}</Badge>
                </div>
                {viewingNotification.target_id && (
                  <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Target ID</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{viewingNotification.target_id}</span>
                  </div>
                )}
                <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Priority</span>
                  <Badge size="sm" variant="light" color={getPriorityColor(viewingNotification.priority)}>{viewingNotification.priority}</Badge>
                </div>
                {viewingNotification.image_url && (
                  <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Image</span>
                    <a href={viewingNotification.image_url} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline text-sm truncate max-w-xs">
                      {viewingNotification.image_url}
                    </a>
                  </div>
                )}
                <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Sender ID</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{viewingNotification.sender_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Created</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {viewingNotification.created_at ? date_formate(viewingNotification.created_at) : '-'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">Loading...</div>
            )}
            <div className="flex gap-3 mt-6 justify-end">
              <Button type="button" variant="outline" onClick={() => setViewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default NotificationsTable;

