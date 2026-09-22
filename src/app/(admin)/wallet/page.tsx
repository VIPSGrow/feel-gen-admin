import type { Metadata } from "next";
import React from "react";
import Button from '@/components/ui/button/Button'

import WalletMetrics from "@/components/admin/wallet/WalletMetrics";
import Transaction from "@/components/admin/wallet/Transaction";
import QuickShortcuts from "@/components/admin/wallet/QuickShortcuts";
import SetPin from "@/components/admin/wallet/SetPin";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Wallet | Feel Safe",
  description: "Manage wallet balances, pending/mature commissions (30-day hold for returns), transactions."
};



const WalletPage = () => {
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Wallet Dashboard
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Manage balances and commissions. Commissions held 30 days; mature if no product return.
          </p>
        </div>
        <Link href="/withdrawals"><Button className="w-50 h-14" variant="primary" >Withdraw</Button></Link>
      </div>
      <SetPin />
      {/* <QuickShortcuts /> */}
      {/* Metrics & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-12">
          <WalletMetrics cols={5} />
        </div>
      </div>

      {/* Charts */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Balance History</h3>
          <LineChartOne />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Transaction Volume</h3>
          <BarChartOne />
        </div>
      </div> */}

      {/* Table */}
      <Transaction />
    </div>
  );
};

export default WalletPage;

