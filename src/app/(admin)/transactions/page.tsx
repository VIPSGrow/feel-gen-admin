"use client";

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table/index";
import Badge from "@/components/ui/badge/Badge";
import serverCallFuction, { formattedAmount } from "@/lib/constantFunction";
import { formatDate } from '@fullcalendar/core/index.js';
import type { TransactionItem } from '@/types/wallet-type';
import { FilterIcon } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import AddTransactionModal from '@/components/admin/transactions/AddTransactionModal';

const TransactionsPage = () => {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  const [memberSearch, setMemberSearch] = useState('');
  const [members, setMembers] = useState<Array<{ id: number; name?: string; email?: string }>>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: number; name?: string; email?: string } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [walletStats, setWalletStats] = useState<{
    total_amount?: string;
    pending_amount?: string;
    withdrawable_amount?: string;
    tds_deductions?: string;
  } | null>(null);
  const [error, setError] = useState<string>('');

  const isSuperAdmin = user?.role === 'Super Admin';

  const fetchTransactions = async (endpoint: string = 'api/transactions/transactions') => {
    setLoading(true);
    setError('');

    try {
      const res = await serverCallFuction('GET', endpoint);
      const success = (res as { success?: boolean })?.success;
      const data = (res as { data?: TransactionItem[] })?.data;

      if (success && Array.isArray(data)) {
        setTransactions(data);
      } else {
        setError((res as { message?: string })?.message || 'Failed to load transactions');
      }
    } catch {
      setError('Network error while loading transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const buildEndpointWithUserId = (baseEndpoint: string, userId: number | null) => {
    if (!userId) return baseEndpoint;
    return `${baseEndpoint}?page=1&limit=20&userId=${userId}`;
  };

  useEffect(() => {
    if (!isFilterOpen) return;

    const fetchMembers = async () => {
      setMembersLoading(true);
      type MembersRes = {
        success?: boolean;
        status?: boolean;
        data?: Array<{ id: number | string; name?: string; email?: string }>;
      };

      try {
        const res = await serverCallFuction('GET', 'api/users/downline');
        const r = res as MembersRes;

        if (r && r.success !== false) {
          setMembers(
            (r.data || []).map((m) => ({
              id: Number(m.id),
              name: m.name,
              email: m.email,
            }))
          );
        }
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, [isFilterOpen]);

  const handleApplyFilter = async () => {
    if (!selectedUserId) return;

    setFilterLoading(true);
    setError('');

    try {
      const endpoint = buildEndpointWithUserId('api/transactions/transactions', selectedUserId);
      const res = await serverCallFuction('GET', endpoint);
      const success = (res as { success?: boolean })?.success;
      const data = (res as { data?: TransactionItem[] })?.data;

      if (success && Array.isArray(data)) {
        setWalletStats(res?.wallet);
        setTransactions(data);
        setIsFilterOpen(false);
      } else {
        setError(
          (res as { message?: string })?.message || 'Failed to load filtered transactions'
        );
      }
    } catch {
      setError('Network error while loading filtered transactions');
    } finally {
      setFilterLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">All wallet transactions (credit/debit).</p>
        </div>

        <Button onClick={() => setIsAddTransactionOpen(true)}>Add Transaction</Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error-50 border border-error-200 text-error-700 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 space-y-2">
        {walletStats ? (
          <>

            {selectedUser && <div>
              Selected Member - {selectedUser?.name} | {selectedUser?.email}</div>}

            <div className="grid grid-cols-4 gap-2 text-sm">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl dark:bg-emerald-900/30">
                  <span className="text-emerald-600 size-6 dark:text-emerald-400 text-center">₹</span>
                </div>
                <div className="flex items-end justify-between mt-5">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Balance</span>
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white">
                      ₹{formattedAmount(Number(walletStats?.total_amount || 0))}
                    </h4>
                  </div>
                  <Badge color="success">+2.4%</Badge>
                </div>
              </div>

              <div className="rounded-2xl border border-warning-200 bg-white p-5 dark:border-warning-800 dark:bg-gray-900 md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-xl dark:bg-warning-900/30">
                  <span className="text-warning-600 size-6 dark:text-warning-400 text-center">₹</span>
                </div>
                <div className="flex items-end justify-between mt-5">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Pending Balance</span>
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white">
                      ₹{formattedAmount(Number(walletStats?.pending_amount || 0))}
                    </h4>
                  </div>
                  <Badge color="warning">+2.4%</Badge>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl dark:bg-emerald-900/30">
                  <span className="text-emerald-600 size-6 dark:text-emerald-400 text-center">₹</span>
                </div>
                <div className="flex items-end justify-between mt-5">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Available Balance</span>
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white">
                      ₹{formattedAmount(Number(walletStats?.withdrawable_amount || 0))}
                    </h4>
                  </div>
                  <Badge color="success">+2.4%</Badge>
                </div>
              </div>

              <div className="rounded-2xl border border-warning-200 bg-white p-5 dark:border-warning-800 dark:bg-gray-900 md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-xl dark:bg-warning-900/30">
                  <span className="text-warning-600 size-6 dark:text-warning-400 text-center">₹</span>
                </div>
                <div className="flex items-end justify-between mt-5">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">TDS Deductions</span>
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white">
                      ₹{formattedAmount(Number(walletStats?.tds_deductions || 0))}
                    </h4>
                  </div>
                  <Badge color="warning">+2.4%</Badge>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-900">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05] flex items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Transactions</h3>
          <Badge
            color="info"
            variant="solid"
            className={`ml-2 cursor-pointer ${isSuperAdmin ? '' : 'opacity-50 cursor-not-allowed'}`}
            onClick={() => {
              if (!isSuperAdmin) return;
              setIsFilterOpen(true);
            }}
          >
            <FilterIcon className="w-4 h-4" />
          </Badge>
        </div>

        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1100px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-gray-100 text-left">
                    Date
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-gray-100 text-left">
                    Type
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-gray-100 text-left">
                    Total Amount
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-gray-100 text-left">
                    Commission Type
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-gray-100 text-left">
                    Generation
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-gray-100 text-left">
                    Source User
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-gray-100 text-left">
                    Order / Package
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-gray-100 text-left">
                    Status
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                      <TableCell colSpan={8} className="px-6 py-6 text-gray-600 dark:text-gray-300">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="px-6 py-6 text-gray-600 dark:text-gray-300">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {tx.created_at ? formatDate(tx.created_at) : '-'}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        <Badge color={tx.type === 'credit' ? 'success' : 'error'} variant="solid">
                          {tx.type?.toUpperCase()}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 font-bold text-emerald-600">
                        ₹{formattedAmount(Number(tx.total_amount ?? tx.amount))}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 text-emerald-600">
                        {tx.commission_type || tx.category || 'Commission'}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {tx.generation_level ? `Generation ${tx.generation_level}` : 'Direct Partner'}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {tx.source_user || tx.full_name || '-'}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {tx.order_reference || tx.remarks || '-'}
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <Badge
                          color={
                            (tx.commission_status || tx.status) === 'mature' || (tx.commission_status || tx.status) === 'completed'
                              ? 'success'
                              : (tx.commission_status || tx.status) === 'pending'
                                ? 'warning'
                                : 'error'
                          }
                        >
                          {tx.commission_status || tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} className="max-w-4xl">
        <div className="p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold">Filter by Member</h2>
              <p className="text-sm text-gray-500">Select one member (Super Admin only) and click Filter.</p>
            </div>
            <Button variant="outline" onClick={() => setIsFilterOpen(false)}>
              Close
            </Button>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Search members..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Members</span>
                  {membersLoading ? <span className="text-sm text-gray-500">Loading...</span> : null}
                </div>

                <div className="max-h-[45vh] overflow-y-auto space-y-2 pr-1">
                  {members
                    .filter((m) => {
                      const q = memberSearch.trim().toLowerCase();
                      if (!q) return true;
                      const name = String(m?.name || '').toLowerCase();
                      const email = String(m?.email || '').toLowerCase();
                      return name.includes(q) || email.includes(q);
                    })
                    .map((m) => {
                      const id = Number(m?.id);
                      const selected = selectedUserId === id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedUserId(id)
                            setSelectedUser(m);
                          }}
                          className={`w-full text-left rounded-lg border p-3 transition ${selected
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                          <div className="font-medium text-gray-900">{m?.name || '-'} </div>
                          <div className="text-sm text-gray-500">{m?.email || ''}</div>
                        </button>
                      );
                    })}

                  {!membersLoading && members.length === 0 ? (
                    <div className="text-sm text-gray-500">No members found.</div>
                  ) : null}
                </div>
              </div>

              <div className="border rounded-xl p-3">
                <div className="font-medium mb-2">Selected Member</div>
                <div className="text-sm text-gray-700">
                  Selected userId: <span className="font-semibold">{selectedUserId ?? '-'}</span>
                </div>

                <div className="mt-6">
                  <Button onClick={handleApplyFilter} disabled={!selectedUserId || filterLoading}>
                    {filterLoading ? 'Filtering...' : 'Filter'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <AddTransactionModal
        selectedUser={selectedUser}
        prefillUserId={selectedUserId ?? undefined}
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        onSuccess={() => fetchTransactions()}
      />
    </div>
  );
};

export default TransactionsPage;

