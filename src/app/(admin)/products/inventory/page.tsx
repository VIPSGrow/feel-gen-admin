"use client";

import React, { useState, useEffect, useCallback } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/hooks/useModal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Textarea from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import { InventoryItem, InventoryResponse } from '@/types/inventory';
import Image from 'next/image';

const InventoryPage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const inventoryModal = useModal();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState('');
  const { role } = useAuth();
  const isSuperAdmin = role?.toLowerCase() === 'super admin';

  const fetchInventory = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = (await serverCallFuction(
        'GET',
        `api/inventory/my?page=${page}&limit=20`
      )) as InventoryResponse;

      if (response.success && response.data) {
        setInventory(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.message || 'Failed to fetch inventory');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleUpdateInventory = async () => {
    if (!selectedItem || adjustment === 0 || !reason.trim()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        product_id: selectedItem.product.id,
        variant_id: selectedItem.variant?.id ?? null,
        quantity: adjustment,
        reason: reason.trim(),
      };

      const response = await serverCallFuction('POST', 'api/inventory/adjust', payload) as InventoryResponse;

      if (response.success) {
        inventoryModal.closeModal();
        setSelectedItem(null);
        setAdjustment(0);
        setReason('');
        fetchInventory();
      } else {
        setError(response.message || 'Failed to update inventory');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to update inventory');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVariantLabel = (item: InventoryItem) => {
    if (!item.variant) return '-';
    const attrs = item.variant.attr_combinations
      .map((a) => a.value)
      .join(', ');
    return attrs || '-';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-gray-300">
            My Inventory
          </h1>
          <p className="text-muted-foreground dark:text-gray-500">
            View your current stock levels
          </p>
        </div>
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          Loading inventory...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-gray-300">
            My Inventory
          </h1>
          <p className="text-muted-foreground dark:text-gray-500">
            View your current stock levels — auto-generated and adjusted by
            system
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-900">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1100px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left"
                  >
                    Product
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left"
                  >
                    Variant
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left"
                  >
                    SKU
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left"
                  >
                    Base Price
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left"
                  >
                    Quantity
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left"
                  >
                    Last Updated
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {inventory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No inventory items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  inventory.map((item) => (
                    <TableRow key={item.id}>
                      {/* Product Info */}
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shrink-0">
                            {item.product.f_image ? (
                              <Image
                                width={48}
                                height={48}
                                src={item.product.f_image}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                                No Img
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="block font-medium text-gray-900 dark:text-white">
                              {item.product.name}
                            </span>
                            <span className="block text-sm text-gray-500 dark:text-gray-400">
                              {item.product.slug}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Variant */}
                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {getVariantLabel(item)}
                      </TableCell>

                      {/* SKU */}
                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-sm">
                        {item.variant?.sku?.trim() || '-'}
                      </TableCell>

                      {/* Base Price */}
                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        <span className="text-emerald-600 font-semibold">
                          ₹{item.product.base_price}
                        </span>
                      </TableCell>

                      {/* Quantity */}
                      <TableCell className="px-6 py-4">
                        <Badge
                          color={
                            item.quantity > 100
                              ? 'success'
                              : item.quantity > 20
                                ? 'warning'
                                : 'error'
                          }
                          variant="solid"
                          size="sm"
                        >
                          {item.quantity}
                        </Badge>
                      </TableCell>

                      {/* Last Updated */}
                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                        {formatDate(item.updated_at)}
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell className="px-6 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setAdjustment(0);
                              setReason('');
                              inventoryModal.openModal();
                            }}
                          >
                            Update Inventory
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination Info */}
      {inventory.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            Showing {inventory.length} of {pagination.total} items
          </span>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
        </div>
      )}

      {/* Super Admin Inventory Update Modal */}
      {inventoryModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Update Inventory</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Adjust stock quantity for selected item</p>
            </div>
            <div className="px-6 pb-6 max-h-96 overflow-y-auto">
              {selectedItem && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white block mb-1">Product</label>
                    <div className="font-semibold text-gray-900 dark:text-white">{selectedItem.product.name}</div>
                    {selectedItem.variant && (
                      <div className="text-sm text-gray-500">{getVariantLabel(selectedItem)}</div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white block mb-1">Current Quantity</label>
                    <div className="text-2xl font-bold text-emerald-600">{selectedItem.quantity}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white block mb-1">Adjustment Amount</label>
                    <div className="flex gap-2 mb-1">
                      <button
                        type="button"
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-sm font-medium"
                        onClick={() => setAdjustment(adjustment - 1)}
                      >
                        -1
                      </button>
                      <input
                        type="number"
                        className="flex-1 h-12 text-lg px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-center"
                        placeholder="0"
                        value={adjustment || ''}
                        onChange={(e) => setAdjustment(Number(e.target.value) || 0)}
                      />
                      <button
                        type="button"
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-sm font-medium"
                        onClick={() => setAdjustment(adjustment + 1)}
                      >
                        +1
                      </button>
                    </div>
                    <div className="text-sm font-medium">
                      New Quantity: <span className={selectedItem.quantity + adjustment < 0 ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>{selectedItem.quantity + adjustment}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white block mb-1">Reason <span className="text-red-500">*</span></label>
                    <textarea
                      className="mt-1 w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-vertical"
                      placeholder="Enter reason for inventory adjustment (required)..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                    ></textarea>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 pt-4 pb-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    inventoryModal.closeModal();
                    setSelectedItem(null);
                    setAdjustment(0);
                    setReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  disabled={adjustment === 0 || !reason.trim() || loading}
                  onClick={handleUpdateInventory}
                >
                  {loading ? 'Updating...' : 'Update Inventory'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InventoryPage;

