"use client";
import React, { useEffect, useState } from 'react';
import AttributesTable from '@/components/admin/attributes/AttributesTable';
import AttributeModal from '@/components/admin/attributes/AttributeModal';
import AttributeValueModal from '@/components/admin/attributes/AttributeValueModal';
import { Attribute, AttributeFormData } from '@/components/admin/attributes/types';

import { Plus, Settings } from 'lucide-react';
import serverCallFuction from '@/lib/constantFunction';

const AttributesPage = () => {
  const [attributes, setAttributes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedAttrId, setSelectedAttrId] = useState<number | null>(null);
  const [isValueModalOpen, setIsValueModalOpen] = useState(false);

  if (error) {
    // Error display can be added here or via toast later
    console.error(error);
  }


  const handleFetchAttributes = async () => {
    try {
      const res = await serverCallFuction(
        'GET',
        'api/products/attributes'
      );
      if (res.success) {
        setAttributes(res.data);
        setError('');
      } else {
        setError(res.message || 'Failed to fetch attributes');
      }
    } catch (error) {
      setError('Failed to fetch attributes');
    }
  };

  useEffect(() => {
    handleFetchAttributes();
  }, []);



  const handleAddAttribute = () => {
    setModalMode('add');
    setSelectedAttribute(null);
    setIsModalOpen(true);
  };

  const handleEditAttribute = (attribute: any) => {
    setModalMode('edit');
    setSelectedAttribute(attribute);
    setIsModalOpen(true);
  };

  const handleDeleteAttribute = async (id: number) => {
    if (confirm('Are you sure you want to delete this attribute and all its values?')) {
      setError('');
      try {
        const res = await serverCallFuction('DELETE', `api/products/attributes/${id}`);
        if (res.success) {
          await handleFetchAttributes();
        } else {
          setError(res.message || 'Failed to delete attribute');
        }
      } catch (err) {
        setError('Delete failed');
      }
    }
  };

  const handleAddValue = (attrId: number) => {
    setSelectedAttrId(attrId);
    setIsValueModalOpen(true);
  };

  const handleSaveValue = async (value: string) => {
    if (!selectedAttrId) return;
    setIsSubmitting(true);
    setError('');
    try {
      const res = await serverCallFuction('POST', `api/products/attributes/${selectedAttrId}/values`, { value });
      if (res.success) {
        await handleFetchAttributes();
      } else {
        setError(res.message || 'Failed to add value');
      }
    } catch (err) {
      setError('Failed to add value');
    } finally {
      setIsSubmitting(false);
    }
    setIsValueModalOpen(false);
  };

  const handleSaveAttribute = async (data: AttributeFormData) => {
    setIsSubmitting(true);
    setError('');
    try {
      if (modalMode === 'add') {
        const res = await serverCallFuction('POST', 'api/products/attributes', { name: data.name });
        if (res.success) {
          await handleFetchAttributes();
        } else {
          setError(res.message || 'Failed to create attribute');
        }
      } else if (selectedAttribute) {
        const res = await serverCallFuction('PUT', `api/products/attributes/${selectedAttribute.id}`, { name: data.name });
        if (res.success) {
          await handleFetchAttributes();
        } else {
          setError(res.message || 'Failed to update attribute');
        }
      }
    } catch (err) {
      setError('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attributes</h1>
            <p className="text-gray-400 mt-1">Manage product attributes and their values ({attributes.length} total).</p>
          </div>
          <button
            onClick={handleAddAttribute}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <Plus className="w-4 h-4" />
            Add Attribute
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AttributesTable
              attributes={attributes as Attribute[]}
              onEdit={handleEditAttribute}
              onDelete={handleDeleteAttribute}
              onAddValue={handleAddValue}
            />
          </div>
          <div className="lg:col-span-1 space-y-4">
            <div className="p-6 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-900">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-xl dark:bg-blue-900/20">
                  <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Total Attributes</h3>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {attributes.length}
                  </span>
                </div>
              </div>
            </div>
            {/* <div className="p-6 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <h3 className="font-semibold text-gray-900 mb-4 dark:text-white">Next Steps</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Implement Add/Edit Values modal</li>
                <li>• Connect to PostgreSQL DB with Prisma</li>
                <li>• Create API routes: GET/POST/PUT/DELETE /api/attributes</li>
                <li>• Replace mock data with real API calls</li>
              </ul>
            </div> */}
          </div>
        </div>

        <AttributeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAttribute}
          initialData={selectedAttribute ? { name: selectedAttribute.name } : undefined}
          title={modalMode === 'add' ? 'Add New Attribute' : 'Edit Attribute'}
        />

        <AttributeValueModal
          isOpen={isValueModalOpen}
          onClose={() => setIsValueModalOpen(false)}
          attributeId={selectedAttrId || 0}
          onSave={handleSaveValue}
          currentValues={selectedAttrId ? (attributes.find(a => a.id === selectedAttrId)?.attrvalues?.map(v => v.value) || []) : []}
        />

      </div>

      {error && (
        <div className="p-4 mb-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}
    </>
  );
};

export default AttributesPage;

