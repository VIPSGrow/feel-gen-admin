"use client";
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';


interface DropZoneProps {
  onFilesChange: (files: File[]) => void;
  label?: string;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number; // MB
  multiple?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({
  onFilesChange,
  label = 'Drag & drop images here, or click to select',
  accept = {
    'image/png': [],
    'image/jpeg': [],
    'image/webp': [],
    'image/svg+xml': [],
  },
  maxFiles = 1,
  maxSize = 5,
  multiple = false,
}) => {
  const onDrop = (acceptedFiles: File[]) => {
    onFilesChange(acceptedFiles.slice(0, maxFiles));
  };



  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize: maxSize * 1024 * 1024,
    multiple,
  });

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer hover:border-brand-500 hover:bg-brand-500/5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
          isDragActive
            ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500 ring-offset-2'
            : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center pointer-events-none">
          <div className="w-12 h-12 mb-4 p-2 bg-brand-100 dark:bg-brand-900/50 rounded-lg flex items-center justify-center">
            <Upload className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            {isDragActive ? 'Drop the files here ...' : label}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG, WebP, SVG up to {maxSize}MB {multiple ? '(multiple)' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DropZone;

