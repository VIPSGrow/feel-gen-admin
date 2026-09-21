"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/modal';

interface AttributeValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  attributeId: number;
  onSave: (value: string) => void;
  initialValue?: string;
  title?: string;
  currentValues?: string[]; // For uniqueness check
}

const AttributeValueModal: React.FC<AttributeValueModalProps> = ({
  isOpen,
  onClose,
  attributeId,
  onSave,
  initialValue,
  title = 'Add Attribute Value',
  currentValues = [],
}) => {
const [formData, setFormData] = useState(initialValue || '');
  const [errors, setErrors] = useState<{ value?: string }>({});;

  const validate = (): boolean => {
    const newErrors: { value?: string } = {};
    const trimmedValue = formData.trim();
    if (!trimmedValue) {
      newErrors.value = 'Value name is required';
    } else if (currentValues.some(v => v.toLowerCase() === trimmedValue.toLowerCase() && v !== initialValue)) {
      newErrors.value = 'Value already exists';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg mx-auto">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 p-1 -m-1 rounded-lg"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Value Name
            </label>
            <input
              id="value"
              type="text"
              value={formData}
              onChange={(e) => setFormData(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition ${
                errors.value 
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
              placeholder="e.g., Red, Large"
              maxLength={50}
            />
            {errors.value && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.value}</p>
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
              disabled={!formData.trim()}
            >
              Save Value
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AttributeValueModal;

