import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import Image from 'next/image';
import { Attribute } from './types';
import { Pencil, Trash2, ChevronDown, Plus } from 'lucide-react';
import Pagination from '../../tables/Pagination';

interface AttributesTableProps {
  attributes: Attribute[];
  onEdit: (attribute: Attribute) => void;
  onDelete: (id: number) => void;
  onAddValue: (attrId: number) => void;
}

const AttributesTable: React.FC<AttributesTableProps> = ({
  attributes,
  onEdit,
  onDelete,
  onAddValue,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(attributes.length / itemsPerPage);
  const paginatedAttributes = attributes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-900">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-100">
                    Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-100">
                    Values Count
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-100">
                    Values
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-100">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedAttributes.map((attr) => (
                  <TableRow key={attr.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {attr.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
<Badge size="sm" color="info">{attr.attrvalues?.length ?? 0}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {attr.attrvalues && attr.attrvalues.length > 0 
                        ? attr.attrvalues.slice(0, 5).map(v => v.value).join(', ') + (attr.attrvalues.length > 5 ? '...' : '')
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          onClick={() => onAddValue(attr.id)}
                          className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-500/10 rounded-lg transition"
                          title="Add Value"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(attr)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(attr.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default AttributesTable;

