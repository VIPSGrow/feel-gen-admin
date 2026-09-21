"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import { ApiResponse, KycDocument, KycRequest } from '@/types/kyc';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Avatar from '@/components/ui/avatar/Avatar';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import { Check, CheckCircle, Download, Eye, XCircle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import Alert from '@/components/ui/alert/Alert';
import { formatDate } from '@fullcalendar/core/index.js';
import { ListIcon } from '@/icons';

type KycPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

type KycListResponse = {
  success?: boolean;
  status?: boolean;
  message?: string;
  data?: KycRequest[];
  pagination?: KycPagination;
  // backend may also return plain array without pagination
};

export default function KycRequestsPage() {
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'under_review' | 'approved' | 'rejected'
  >('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pagesCount, setPagesCount] = useState(0);

  // Modals
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<KycDocument[]>([]);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const query = new URLSearchParams();
      query.set('page', String(page));
      query.set('limit', String(limit));

      if (statusFilter !== 'all') query.set('status', statusFilter);

      const q = searchTerm.trim();
      if (q) query.set('search', q);

      const endpoint = `api/users/admin/kyc-requests?${query.toString()}`;

      const res = (await serverCallFuction(
        'GET',
        endpoint
      )) as ApiResponse<KycRequest[]> | KycListResponse;

      const resAny = res as unknown as {
        status?: boolean;
        success?: boolean;
        message?: string;
        data?: unknown;
        pagination?: unknown;
      };
      const ok = typeof resAny?.status === 'boolean' ? resAny.status : resAny?.success;


      const data: KycRequest[] | undefined = Array.isArray(resAny?.data)
        ? resAny.data
        : Array.isArray(resAny)
          ? resAny
          : undefined;

      if (ok === false) {
        setError(resAny?.message || 'Failed to fetch KYC requests');
        return;
      }

      if (data) {
        setRequests(data);

        const pagination = resAny?.pagination as KycPagination | undefined;
        if (pagination && typeof pagination.page === 'number') {
          setPage(pagination.page || 1);
          setLimit(typeof pagination.limit === 'number' ? pagination.limit : limit);
          setTotal(typeof pagination.total === 'number' ? pagination.total : 0);
          setPagesCount(typeof pagination.pages === 'number' ? pagination.pages : 0);

        } else {
          setTotal(data.length);
          setPagesCount(1);
        }
      } else {
        setRequests([]);
        setTotal(0);
        setPagesCount(0);
      }
    } catch (e) {
      setError('Error fetching KYC requests');
    } finally {
      setLoading(false);
    }
  }, [limit, page, searchTerm, statusFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, limit]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const statusConfig = [
    { value: 'all' as const, label: 'All' },
    { value: 'under_review' as const, label: 'Under Review' },
    { value: 'approved' as const, label: 'Approved' },
    { value: 'rejected' as const, label: 'Rejected' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'under_review':
      default:
        return 'warning';
    }
  };

  const openDocumentsModal = useCallback((request: KycRequest) => {
    setSelectedRequest(request);
    setSelectedDocuments(request.documents || []);
    setDocumentsModalOpen(true);
  }, []);

  const updateStatus = useCallback(
    async (id: number, newStatus: 'approved' | 'rejected') => {
      const action = newStatus.toLowerCase();
      const message = `This will ${action} the KYC request and all associated documents.\nAre you sure you want to proceed?`;

      if (!confirm(message)) return;

      try {
        const res = (await serverCallFuction(
          'PUT',
          `api/users/admin/kyc-requests/${id}`,
          { status: newStatus }
        )) as any;

        if (res?.status !== false) {
          setRequests((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
          );
        } else {
          alert(res?.message || 'Update failed');
        }
      } catch {
        alert('Update failed');
      }
    },
    []
  );

  const handleApproved = useCallback(
    async (item: KycRequest, status: 'approved' | 'rejected') => {
      if (item.pending_docs !== '0') {
        alert('Please review all pending documents before approving the request.');
        return;
      }
      await updateStatus(item.id, status);
    },
    [updateStatus]
  );

  const updateDocStatus = useCallback(async (id: number, newStatus: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${newStatus} this Document?`)) return;

    try {
      const res = (await serverCallFuction(
        'PUT',
        `api/users/kyc/doc-update/${id}`,
        { status: newStatus }
      )) as any;

      if (res?.status !== false) {
        setSelectedDocuments((prev) =>
          prev.map((doc) => (doc.doc_id === id ? { ...doc, status: newStatus } : doc))
        );
      } else {
        alert(res?.message || 'Update failed');
      }
    } catch {
      alert('Update failed');
    }
  }, []);

  const filteredRequests = requests;

  // Pagination UI helpers
  const curr = page;
  const totalPages = pagesCount || 1;
  const start = Math.max(1, curr - 2);
  const end = Math.min(totalPages, curr + 2);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
            <ListIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              KYC Requests
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Manage KYC verification requests</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 w-full"
            />


            <Select
              options={statusConfig}
              defaultValue={statusFilter}
              onChange={(value: string) => {
                const status = value as 'all' | 'under_review' | 'approved' | 'rejected';
                setStatusFilter(status);
              }}
              placeholder="Filter by status"
              className="w-8"
            />
          </div>
        </div>
      </div>

      {error ? <Alert variant="error" title="Error" message={error} /> : null}

      <div className="rounded-xl border bg-card overflow-hidden bg-white dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">User</TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Email</TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Status</TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Submitted</TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Documents</TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 py-6 text-gray-600 dark:text-gray-300">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-3">
                        <Avatar src={'/images/user/user-01.jpg'} alt={request.full_name} size="medium" />
                        <div>
                          <div className="font-medium">{request.full_name}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <div>
                        <div className="font-sm">{request.email}</div>
                        <div className="text-sm text-gray-500">{request.phone}</div>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <Badge size="sm" color={getStatusColor(request.status)}>
                        {request.status === 'under_review'
                          ? 'Under Review'
                          : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {request.created_at ? formatDate(request.created_at) : '-'}
                    </TableCell>

                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      Pending: {request.pending_docs} | Approved: {request.approved_docs}
                    </TableCell>

                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openDocumentsModal(request)}>
                          <Eye className="w-4 h-4" />
                        </Button>

                        {request.status === 'under_review' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproved(request, 'approved')}
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproved(request, 'rejected')}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground dark:text-gray-500">
                    {searchTerm || statusFilter !== 'all'
                      ? 'No matching KYC requests found.'
                      : 'No KYC requests yet.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-white/[0.05]">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Showing page <span className="font-semibold">{page}</span>
            {pagesCount ? <span> &nbsp; / &nbsp; {pagesCount} total pages</span> : null}
            {total ? <span className="ml-2">({total} total)</span> : null}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={i === page ? 'primary' : 'outline'}
                  onClick={() => setPage(i)}
                  disabled={loading}
                >
                  {i}
                </Button>
              ))}
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={(pagesCount ? page >= pagesCount : false) || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>

            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Rows</span>
              <select
                className="h-9 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-gray-200"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                disabled={loading}
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={documentsModalOpen}
        onClose={() => setDocumentsModalOpen(false)}
        className="max-w-lg mx-auto"
      >
        <div className="p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Documents for {selectedRequest?.full_name || 'User'}</h2>
            <Button variant="ghost" size="sm" onClick={() => setDocumentsModalOpen(false)} className="h-8 w-8 p-0">
              <XCircle className="w-4 h-4" />
            </Button>
          </div>

          {selectedDocuments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No documents available.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDocuments.map((doc) => (
                <div
                  key={doc.doc_id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                        {doc.document_type}
                      </h3>
                      <Badge
                        size="sm"
                        color={doc.status === 'approved' ? 'success' : doc.status === 'rejected' ? 'error' : 'warning'}
                      >
                        {doc.status}
                      </Badge>
                    </div>

                    <div className="flex flex-col items-end gap-2 items-align-center">
                      <Badge size="sm">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          View
                        </a>
                      </Badge>

                      {doc.status !== 'approved' ? (
                        <Badge
                          size="sm"
                          variant="solid"
                          color="success"
                          onClick={() => updateDocStatus(doc.doc_id, 'approved')}
                        >
                          <Check className="w-4 h-4" />
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

