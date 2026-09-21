"use client"
import React, { useState, useRef, useEffect } from 'react';
import { AttributeFormData } from './types';
import { Modal } from '@/components/ui/modal';

interface AttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AttributeFormData) => void;
  initialData?: AttributeFormData;
  title: string;
}

const AttributeModal: React.FC<AttributeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  title,
}) => {
  const [formData, setFormData] = useState<AttributeFormData>({ name: '' });
  const [errors, setErrors] = useState<{ name?: string }>({});

  const prevInitialData = useRef(initialData);

  useEffect(() => {
    if (initialData !== prevInitialData.current) {
      prevInitialData.current = initialData;
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({ name: '' });
      }
      setErrors({});
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: { name?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Attribute name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className='max-w-lg mx-auto'>
      <div className='p-6'>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 p-1 -m-1 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Attribute Name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition ${
              errors.name 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
            placeholder="e.g., Color, Size"
            maxLength={50}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>

        <div className="flex gap-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:focus:ring-offset-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Save Attribute
          </button>
        </div>
      </form>
      </div>
    </Modal>
  );
};

export default AttributeModal;

