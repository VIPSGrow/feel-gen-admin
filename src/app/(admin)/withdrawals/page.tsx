"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import serverCallFuction from '@/lib/constantFunction';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { WithdrawalRequest, CappingType, WithdrawalStatus } from '@/types/wallet-type';
import { ListIcon } from '@/icons';
import { formatDate } from '@fullcalendar/core/index.js';
import { Modal } from '@/components/ui/modal';
import WithdrawalForm from '@/components/withdraw/WithdrawalForm';
import { Wallet } from 'lucide-react';
import WalletMetrics from '@/components/admin/wallet/WalletMetrics';
import SetPin from '@/components/admin/wallet/SetPin';
import Transaction from '@/components/admin/wallet/Transaction';
import { useRouter } from 'next/navigation';

// import { format, parseISO } from 'date-fns';

// Mock data (replace with real API)
const mockWithdrawals: WithdrawalRequest[] = [

  // Add more
];

export default function WithdrawalsPage() {
  const { user, hasPermission } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [cappings, setCappings] = useState<CappingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredWithdrawals, setFilteredWithdrawals] = useState<WithdrawalRequest[]>([]);

  const router = useRouter();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    userSearch: '',
    users: [] as WithdrawalRequest[],
    selectedUser: null as WithdrawalRequest | null,
    uvAmount: 0,
    rsAmount: 0,
    bankName: '',
    accountNo: '',
    ifsc: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {

    if (!hasPermission('withdrawals')) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch withdrawals
        const withdrawalsRes = await serverCallFuction('GET', 'api/admin/withdrawals') || { data: [] };
        const wData = withdrawalsRes.data || mockWithdrawals;

        // Fetch cappings
        const cappingRes = await serverCallFuction('GET', 'api/settings/capping/list');
        const cData = cappingRes.data || [];

        setWithdrawals(wData);
        setCappings(cData);
      } catch (error) {
        console.error('Fetch error:', error);
        setWithdrawals(mockWithdrawals);
        setCappings([]); // use mock cappings if needed
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = withdrawals.filter(w =>
      w.userName.toLowerCase().includes(search.toLowerCase()) ||
      w.status.includes(search.toLowerCase())
    );
    setFilteredWithdrawals(filtered);
  }, [search, withdrawals]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (formData.userSearch.length < 2) {
        setFormData(fd => ({ ...fd, users: [] }));
        return;
      }
      try {
        const res = await serverCallFuction('GET', `api/admin/users?search=${formData.userSearch}`) || { data: [] };
        setFormData(fd => ({ ...fd, users: res.data || [] as WithdrawalRequest[] }));
      } catch (error) {
        console.error('User search error', error);
        setFormData(fd => ({ ...fd, users: [] }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.userSearch]);

  const handleApprove = async (withdrawal: WithdrawalRequest) => {
    // Find capping for level
    const capping = cappings.find(c => c.level_no === withdrawal.levelNo);
    if (!capping) {
      alert('Capping not found for level');
      return;
    }

    const dayLimit = parseFloat(capping.day_limit || '0');
    const weekLimit = parseFloat(capping.week_limit || '0');
    const monthLimit = parseFloat(capping.monthly_limit || '0');

    if (withdrawal.balance! < withdrawal.rsAmount) {
      alert('Insufficient balance');
      return;
    }
    if (withdrawal.dayUsed >= dayLimit) {
      alert('Day limit exceeded');
      return;
    }
    if (withdrawal.weekUsed >= weekLimit) {
      alert('Week limit exceeded');
      return;
    }
    if (withdrawal.monthUsed >= monthLimit) {
      alert('Month limit exceeded');
      return;
    }

    try {
      // API call
      const res = await serverCallFuction('POST', `api/admin/withdrawals/${withdrawal.id}/approve`);
      if (res.status) {
        // Update local
        setWithdrawals(prev => prev.map(w =>
          w.id === withdrawal.id ? { ...w, status: 'approved' as WithdrawalStatus } : w
        ));
        alert('Approved successfully');
      } else {
        alert(res.message || 'Approve failed');
      }
    } catch (error) {
      alert('Approve error');
    }
  };

  const handleReject = async (withdrawal: WithdrawalRequest) => {
    try {
      const res = await serverCallFuction('POST', `api/admin/withdrawals/${withdrawal.id}/reject`, { reason: 'Admin rejected' });
      if (res.status) {
        setWithdrawals(prev => prev.map(w =>
          w.id === withdrawal.id ? { ...w, status: 'rejected' as WithdrawalStatus } : w
        ));
        alert('Rejected successfully');
      }
    } catch (error) {
      alert('Reject error');
    }
  };

  if (!hasPermission('withdrawals')) {
    return <div className="p-8 text-center">Access denied. No permission for withdrawals.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
            <ListIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Withdrawals (1 UV = 10 RS)</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage user withdrawal requests</p>
          </div>
        </div>
        <Input
          placeholder="Search by user or status..."
          defaultValue={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        {(user && user.transaction_pin_hash) ?
          <Button onClick={() => setIsCreateOpen(true)}>
            Raise New Request
          </Button> : <Badge color='error' variant='solid'>Please Set Pin First</Badge>}
      </div>

      <SetPin />
      <WalletMetrics cols={4} />

      <Transaction category='withdraw' />

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} className="max-w-4xl">
        <div className="p-6 space-y-4 ">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-brand-600">
              <Wallet size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Withdraw Funds</h2>
              <p className="text-sm text-gray-500">Convert your UV to INR instantly</p>
            </div>
          </div>


          <WithdrawalForm close={() => {
            setIsCreateOpen(false)
            router.refresh()

          }} />

        </div>
      </Modal>
    </div>
  );
}
