import type { Metadata } from "next";
import ReferralMetrics from "@/components/referral/ReferralMetrics";
import ReferralLinkCard from "@/components/referral/ReferralLinkCard";
import ReferralStatsChart from "@/components/referral/ReferralStatsChart";
import ReferralTable from "@/components/referral/ReferralTable";
import ReferralTree from "@/components/referral/ReferralTree";
import React from "react";

export const metadata: Metadata = {
  title: "Referrals - Admin Dashboard | Feel Safe MLM",
  description: "Manage your referral program, track downline, commissions and referral statistics."
};

const ReferralPage = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Referrals Dashboard
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Track your referral performance, downline growth, and total earned commissions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Referral Link Card */}
        <div className="lg:col-span-5">
          <ReferralLinkCard />
        </div>
        {/* Metrics Cards */}
        <div className="lg:col-span-7">
          <ReferralMetrics />
        </div>

      </div>

      {/* Stats Charts */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          <ReferralStatsChart />
        </div>
      </div> */}

      {/* Table and Tree */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-8">
          <ReferralTable />
        </div>
        <div className="lg:col-span-4">
          <ReferralTree />
        </div>
      </div> */}
    </div>
  );
};

export default ReferralPage;

