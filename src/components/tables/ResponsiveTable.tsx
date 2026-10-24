"use client";
import React from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';

export interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  mobileLabel?: string;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyText?: string;
  renderMobileCard?: (row: T) => React.ReactNode;
}

export function ResponsiveTable<T>({ columns, data, keyExtractor, emptyText = 'No data found.', renderMobileCard }: ResponsiveTableProps<T>) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block bg-white dark:bg-gray-900 overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {columns.map((col, i) => (
                <TableCell key={i} isHeader className={`px-6 py-4 font-semibold text-gray-100 dark:text-white text-left ${col.className || ''}`}>
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">{emptyText}</TableCell>
              </TableRow>
            )}
            {data.map((row) => (
              <TableRow key={keyExtractor(row)}>
                {columns.map((col, i) => (
                  <TableCell key={i} className={`px-6 py-4 text-gray-600 dark:text-gray-300 ${col.className || ''}`}>
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {data.length === 0 && (
          <div className="h-24 flex items-center justify-center text-gray-500">{emptyText}</div>
        )}
        {data.map((row) => {
          if (renderMobileCard) return <div key={keyExtractor(row)}>{renderMobileCard(row)}</div>;
          return (
            <div key={keyExtractor(row)} className="rounded-lg  bg-white dark:bg-gray-900 p-4 space-y-2">
              {columns.filter(c => !c.hideOnMobile).map((col, i) => (
                <div key={i} className="flex justify-between gap-2 text-sm">
                  <span className="font-medium text-gray-500 dark:text-gray-400 shrink-0">{col.mobileLabel || col.header}</span>
                  <span className="text-gray-700 dark:text-gray-200 text-right break-words">{col.cell(row)}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default ResponsiveTable;
