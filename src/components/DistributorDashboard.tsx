"use client";
import React, { useState, useEffect } from "react";
import Badge from "./ui/badge/Badge";
import { ArrowUpIcon, GroupIcon } from "@/icons";
import { Clock, CheckCircle, ArrowDownLeft, ArrowDownRight, Wallet, TrendingUp, Users } from "lucide-react";
import type { DistributorDashboardData } from "@/types/dashboard";
import type { MlmPlanResponse } from "@/types/mlm-plan";
import serverCallFuction from "@/lib/constantFunction";
import { useRouter } from "next/navigation";

const DEFAULT_RANK_NAMES: Record<number, string> = {
  0: "Direct Partner",
  1: "Distributor",
  2: "Silver",
  3: "Gold",
  4: "Platinum",
  5: "Diamond",
  6: "Star Diamond",
  7: "Royal Diamond",
};

const DEFAULT_RANK_COLORS: Record<number, { bg: string; text: string }> = {
  0: { bg: "bg-brand-50", text: "text-brand-700 dark:text-brand-300" },
  1: { bg: "bg-gray-50", text: "text-gray-900 dark:text-white" },
  2: { bg: "bg-slate-50", text: "text-slate-700 dark:text-slate-300" },
  3: { bg: "bg-blue-50", text: "text-blue-700 dark:text-blue-300" },
  4: { bg: "bg-purple-50", text: "text-purple-700 dark:text-purple-300" },
  5: { bg: "bg-amber-50", text: "text-amber-700 dark:text-amber-300" },
  6: { bg: "bg-pink-50", text: "text-pink-700 dark:text-pink-300" },
  7: { bg: "bg-rose-50", text: "text-rose-700 dark:text-rose-300" },
};

// Helper to format amount string directly (since API returns strings)
const formatAmount = (value: string | undefined): string => {
    if (!value) return "0.00";
    const num = parseFloat(value);
    if (isNaN(num)) return "0.00";
    if (num >= 100000) {
        return (num / 100000).toFixed(2) + " Lakh";
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + "K";
    }
    return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const commissionAmount = (data: DistributorDashboardData | null, level: number) => {
    if (level === 0) return data?.transactions?.direct_partner_commission;
    return data?.transactions?.generation_commissions?.[String(level)];
};

interface DistributorDashboardProps {
    data: DistributorDashboardData | null;
    loading: boolean;
}

export const DistributorDashboard = ({ data, loading }: DistributorDashboardProps) => {
    const router = useRouter();
    const [rankNames, setRankNames] = useState<Record<number, string>>({});

    useEffect(() => {
        const fetchRanks = async () => {
            try {
                const response = await serverCallFuction<MlmPlanResponse>("GET", "api/settings/mlm-plan");
                if (response && response.data?.ranks) {
                    const mapped: Record<number, string> = {};
                    (response.data.ranks as Array<{ id: number; rank_name: string }>).forEach((rank, index) => {
                        mapped[index + 1] = rank.rank_name;
                    });
                    setRankNames(mapped);
                }
            } catch {
                // Use defaults
            }
        };
        fetchRanks();
    }, []);

    const getRankName = (level: number): string => {
        if (level === 0) return "Direct Partner";
        if (rankNames[level]) return rankNames[level];
        return DEFAULT_RANK_NAMES[level] || `Level ${level}`;
    };

    const getRankColor = (level: number): { bg: string; text: string } => {
        if (DEFAULT_RANK_COLORS[level]) return DEFAULT_RANK_COLORS[level];
        return { bg: "bg-gray-50", text: "text-gray-900 dark:text-white" };
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6 animate-pulse">
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
                        <div className="mt-5 space-y-2">
                            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/2"></div>
                            <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 w-1/3"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profile Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900">
                        <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                            {data?.profile?.full_name?.charAt(0) || "U"}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            {data?.profile?.full_name || "User"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {data?.profile?.email || ""}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge color={data?.profile?.is_active ? "success" : "warning"}>
                                {data?.profile?.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge color={data?.profile?.kyc_status ? "success" : "warning"}>
                                {data?.profile?.kyc_status ? "KYC Verified" : "KYC Pending"}
                            </Badge>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Level: {data?.profile?.level || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wallet Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                        <Wallet className="text-gray-800 size-6 dark:text-white/90" />
                    </div>
                    <div className="mt-5">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Total Balance
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            ₹{formatAmount(data?.wallet?.total_amount || data?.wallet?.total_balance)}
                        </h4>
                    </div>
                </div>

                <div className="rounded-2xl border border-warning-200 bg-white p-5 dark:border-warning-800 dark:bg-gray-900 md:p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-xl dark:bg-warning-900">
                        <Clock className="text-warning-800 size-6 dark:text-warning-400" />
                    </div>
                    <div className="mt-5">
                        <span className="text-sm text-warning-500 dark:text-warning-400">
                            Pending Balance
                        </span>
                        <h4 className="mt-2 font-bold text-warning-800 text-title-sm dark:text-white/90">
                            ₹{formatAmount(data?.wallet?.pending_amount || data?.wallet?.pending_balance)}
                        </h4>
                    </div>
                </div>

                <div className="rounded-2xl border border-success-200 bg-white p-5 dark:border-success-800 dark:bg-gray-900 md:p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-xl dark:bg-success-900">
                        <CheckCircle className="text-success-800 size-6 dark:text-success-400" />
                    </div>
                    <div className="mt-5">
                        <span className="text-sm text-success-500 dark:text-success-400">
                            Available Balance
                        </span>
                        <h4 className="mt-2 font-bold text-success-800 text-title-sm dark:text-white/90">
                            ₹{formatAmount(data?.wallet?.withdrawable_amount || data?.wallet?.available_balance)}
                        </h4>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Commission Summary</h3>
                    <button onClick={() => router.push('/transactions')} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                        View all
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((level) => {
                        const rankName = getRankName(level);
                        const colors = getRankColor(level);
                        return (
                            <div key={level} className={`rounded-lg ${colors.bg} p-3 dark:bg-gray-800`}>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{rankName}</p>
                                <p className={`mt-1 font-semibold ${colors.text}`}>₹{formatAmount(String(commissionAmount(data, level) || 0))}</p>
                            </div>
                        );
                    })}
                    <div className="rounded-lg bg-success-50 p-3 dark:bg-success-900/20">
                        <p className="text-xs text-success-700 dark:text-success-300">Total commission</p>
                        <p className="mt-1 font-semibold text-success-700 dark:text-success-300">₹{formatAmount(data?.transactions?.total_commissions)}</p>
                    </div>
                    <div className="rounded-lg bg-warning-50 p-3 dark:bg-warning-900/20">
                        <p className="text-xs text-warning-700 dark:text-warning-300">Pending commission</p>
                        <p className="mt-1 font-semibold text-warning-700 dark:text-warning-300">₹{formatAmount(data?.transactions?.pending_commission || data?.wallet?.pending_amount)}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Completed commission</p>
                        <p className="mt-1 font-semibold text-gray-900 dark:text-white">₹{formatAmount(data?.transactions?.completed_commission || data?.wallet?.completed_amount)}</p>
                    </div>
                    <div className="rounded-lg bg-brand-50 p-3 dark:bg-brand-900/20">
                        <p className="text-xs text-brand-700 dark:text-brand-300">Withdrawable amount</p>
                        <p className="mt-1 font-semibold text-brand-700 dark:text-brand-300">₹{formatAmount(data?.transactions?.withdrawable_amount || data?.wallet?.withdrawable_amount)}</p>
                    </div>
                    <div className="rounded-lg bg-error-50 p-3 dark:bg-error-900/20">
                        <p className="text-xs text-error-700 dark:text-error-300">TDS deductions</p>
                        <p className="mt-1 font-semibold text-error-700 dark:text-error-300">₹{formatAmount(data?.transactions?.tds_deductions || data?.wallet?.tds_deductions)}</p>
                    </div>
                </div>
            </div>

            {/* Orders & Transactions */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Orders
                        </h3>
                        <Badge color={data?.orders?.pending_orders ? "warning" : "success"}>
                            {data?.orders?.pending_orders ?? 0} pending
                        </Badge>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Total Orders</span>
                            <span className="font-medium text-gray-800 dark:text-white">{data?.orders?.total_orders ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Total Spent</span>
                            <span className="font-medium text-gray-800 dark:text-white">₹{formatAmount(data?.orders?.total_spent)}</span>
                        </div>
                        {/* <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Avg Order Value</span>
                            <span className="font-medium text-gray-800 dark:text-white">₹{formatAmount(data?.orders?.avg_order_value)}</span>
                        </div> */}
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Delivered</span>
                            <span className="font-medium text-gray-800 dark:text-white">{data?.orders?.delivered_orders ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Cancelled</span>
                            <span className="font-medium text-gray-800 dark:text-white">{data?.orders?.cancelled_orders ?? 0}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/placed_order')}
                        className="mt-4 w-full rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
                    >
                        View Orders
                    </button>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Transactions
                        </h3>
                        <div className="flex gap-2">
                            <Badge color="success">{data?.transactions?.total_credits ?? 0} credit</Badge>
                            <Badge color="error">{data?.transactions?.total_debits ?? 0} debit</Badge>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Total Commissions</span>
                            <span className="font-medium text-success-600 dark:text-success-400">₹{formatAmount(data?.transactions?.total_commissions)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Total Withdrawals</span>
                            <span className="font-medium text-error-600 dark:text-error-400">₹{formatAmount(data?.transactions?.total_withdrawals)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Total Purchases</span>
                            <span className="font-medium text-gray-800 dark:text-white">₹{formatAmount(data?.transactions?.total_purchases)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Referral Bonus</span>
                            <span className="font-medium text-gray-800 dark:text-white">₹{formatAmount(data?.transactions?.total_ref_bonuses)}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/wallet')}
                        className="mt-4 w-full rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
                    >
                        View Transactions
                    </button>
                </div>
            </div>

            {/* Team */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        My Team
                    </h3>
                    <Badge color="success">{data?.team?.total_team_members ?? 0} members</Badge>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                        <div className="flex items-center gap-2">
                            <GroupIcon className="text-gray-400" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">Total Team</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
                            {data?.team?.total_team_members ?? 0}
                        </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                        <div className="flex items-center gap-2">
                            <Users className="text-gray-400" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">Direct Referrals</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
                            {data?.team?.direct_referrals ?? 0}
                        </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="text-gray-400" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">Downline</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
                            {data?.team?.downline_members ?? 0}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => router.push('/network-tree')}
                    className="mt-4 w-full rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
                >
                    View Network Tree
                </button>
            </div>

            {/* Recent Data */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                {/* Recent Orders */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                        Recent Orders
                    </h3>
                    {data?.recent?.orders && data.recent.orders.length > 0 ? (
                        <div className="space-y-3">
                            {data.recent.orders.slice(0, 5).map((order) => (
                                <div key={order.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white">{order.order_id}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-800 dark:text-white">
                                            ₹{formatAmount(order.total_amount)}
                                        </p>
                                        <Badge
                                            color={order.payment_status === 'paid' ? 'success' : order.payment_status === 'pending' ? 'warning' : 'error'}
                                            size="sm"
                                        >
                                            {order.payment_status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400">No recent orders</p>
                    )}
                </div>

                {/* Recent Transactions */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                        Recent Transactions
                    </h3>
                    {data?.recent?.transactions && data.recent.transactions.length > 0 ? (
                        <div className="space-y-3">
                            {data.recent.transactions.slice(0, 5).map((txn) => (
                                <div key={txn.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${txn.type === 'credit' ? 'bg-success-100' : 'bg-error-100'}`}>
                                            {txn.type === 'credit' ? (
                                                <ArrowDownRight className="size-4 text-success-600" />
                                            ) : (
                                                <ArrowDownLeft className="size-4 text-error-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white">{txn.category}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{txn.remarks}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-medium ${txn.type === 'credit' ? 'text-success-600' : 'text-error-600'}`}>
                                            {txn.remarks === "BIMA Booking Commission" ? "-" : `${txn.type === 'credit' ? '+' : '-'} ₹${formatAmount(txn.amount)}`}
                                            {/* {txn.type === 'credit' ? '+' : '-'}₹{formatAmount(txn.amount)} */}
                                        </p>
                                        <Badge
                                            color={txn.status === 'completed' ? 'success' : 'warning'}
                                            size="sm"
                                        >
                                            {txn.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400">No recent transactions</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DistributorDashboard;
