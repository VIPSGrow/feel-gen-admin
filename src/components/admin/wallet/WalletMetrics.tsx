"use client";
import React, { useEffect, useState } from 'react'
import { DollarLineIcon, TimeIcon, CheckCircleIcon, GroupIcon } from "@/icons";
import Badge from "@/components/ui/badge/Badge";
import serverCallFuction, { formattedAmount } from '@/lib/constantFunction';
const WalletMetrics = ({ cols = 2 }) => {

    const [walletData, setWalletData] = useState<WalletType>({
        total_amount: "0.00",
        pending_amount: "0.00",
        withdrawable_amount: "0.00"
    })

    useEffect(() => {

        const fetchMetrics = async () => {
            // Simulate API call
            const res = await serverCallFuction('GET', 'api/wallet/balance');
            if (res.success) {
                setWalletData(res.data)
            }

        }

        fetchMetrics()

    }, []);



    return (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-${cols} md:gap-6`}>
            {/* Total Balance */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl dark:bg-emerald-900/30">
                    {/* <DollarLineIcon className="text-emerald-600 size-6 dark:text-emerald-400" /> */}
                    <span className="text-emerald-600 size-6 dark:text-emerald-400 text-center">₹</span>
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Total Amount</span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white">₹{formattedAmount(Number(walletData?.total_amount ?? walletData?.total_balance ?? 0))}</h4>
                    </div>
                    {/* <Badge color="success">+2.4%</Badge> */}
                </div>
            </div>

            {/* Pending Commissions */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl dark:bg-amber-900/30">
                    <TimeIcon className="text-amber-600 size-6 dark:text-amber-400" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Pending Amount</span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white">₹{formattedAmount(Number(walletData?.pending_amount ?? walletData?.pending_balance ?? 0))}</h4>
                    </div>
                    <Badge color="warning">Pending</Badge>
                </div>
            </div>

            {/* Mature Commissions */}
            <div className="rounded-2xl border border-brand-200 bg-white p-5 dark:border-brand-800 dark:bg-gray-900 md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-brand-100 rounded-xl dark:bg-brand-900/30">
                    <CheckCircleIcon className="text-brand-600 size-6 dark:text-brand-400" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-brand-500 dark:text-brand-400">TDS Deductions</span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white">₹{formattedAmount(Number(walletData?.tds_deductions || 0))}</h4>
                    </div>
                    <Badge color="success">TDS</Badge>
                </div>
            </div>



            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/30">
                    <GroupIcon className="text-blue-600 size-6 dark:text-blue-400" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Withdrawable Amount</span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white">₹{formattedAmount(Number(walletData?.withdrawable_amount ?? walletData?.available_balance ?? 0))}</h4>
                    </div>
                    {/* <Badge color="success">+11%</Badge> */}
                </div>
            </div>

            {/* Total Transactions */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/30">
                    <GroupIcon className="text-blue-600 size-6 dark:text-blue-400" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white">{walletData?.total_transactions}</h4>
                    </div>
                    {/* <Badge color="success">+11%</Badge> */}
                </div>
            </div>
        </div>
    );
};

export default WalletMetrics
