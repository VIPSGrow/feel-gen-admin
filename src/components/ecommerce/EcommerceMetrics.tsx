"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { ClipboardClock, Contact, IndianRupee, Package, Bell, Wallet } from "lucide-react";
import type { DashboardData } from "@/types/dashboard";
import { formattedAmount, formattedAmountPoints } from "@/lib/constantFunction";

interface EcommerceMetricsProps {
  data: DashboardData | null;
  loading: boolean;
}

export const EcommerceMetrics = ({ data, loading }: EcommerceMetricsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-5 md:gap-6">
      {/* Total Users */}
      <div className="rounded-2xl border border-brand-500 bg-white p-5 dark:border-brand-800 dark:bg-brand-900 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-brand-100 rounded-xl dark:bg-brand-800">
          <GroupIcon className="text-brand-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Distributor
          </span>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>

            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data?.users?.total_distributors ?? 0}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            {data?.users?.new_distributors_this_month ?? 0} this month
          </Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400 ">
            Active Distributor
          </span>
        </div>
        <div className="flex items-end justify-between mt-2">
          <div>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data?.users?.active_distributors ?? 0}
            </h4>
          </div>
          {/* <Badge color="success">
            <ArrowUpIcon />
            {data?.users?.new_distributors_this_month ?? 0} this month
          </Badge> */}
        </div>
      </div>


      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400 ">
            In-Active Distributor
          </span>
        </div>
        <div className="flex items-end justify-between mt-2">
          <div>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data?.users?.inactive_distributors ?? 0}
            </h4>
          </div>
          {/* <Badge color="success">
            <ArrowUpIcon />
            {data?.users?.new_distributors_this_month ?? 0} this month
          </Badge> */}
        </div>
      </div>


      {/* KYC Approved */}
      <div className="rounded-2xl border border-success-200 bg-white p-5 dark:border-success-800 dark:bg-success-200 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-xl dark:bg-success-800">
          <Contact className="text-success-500 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <span className="text-sm text-success-800 dark:text-success-800">
            KYC Approved
          </span>
        </div>
        <div className="flex items-end justify-between mt-2">
          <div>

            <h4 className="mt-2 font-bold text-success-800 text-title-sm dark:text-success/90">
              {data?.kyc?.approved_kyc ?? 0}
            </h4>
          </div>
          <Badge color="error">
            {data?.kyc?.pending_kyc ?? 0} pending
          </Badge>

        </div>
      </div>


      {/* Total Orders */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Orders (D)
          </span>
        </div>
        <div className="flex items-end justify-between mt-2">
          <div>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formattedAmount(data?.orders?.total_distributor_revenue ?? 0)}
            </h4>
          </div>
        </div>
        <Badge color="success">
          {data?.orders?.total_distributor_orders ?? 0} - orders
        </Badge>
      </div>






      {/* ecom data */}


      {/* Total Users */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total E Users
          </span>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>

            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data?.users?.total_ecom_users ?? 0}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            {data?.users?.new_ecom_users_this_month ?? 0} this month
          </Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400 ">
            Active E Users
          </span>
        </div>
        <div className="flex items-end justify-between mt-2">
          <div>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data?.users?.active_ecom_users ?? 0}
            </h4>
          </div>
          {/* <Badge color="success">
            <ArrowUpIcon />
            {data?.users?.new_distributors_this_month ?? 0} this month
          </Badge> */}
        </div>
      </div>


      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400 ">
            In-Active E Users
          </span>
        </div>
        <div className="flex items-end justify-between mt-2">
          <div>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data?.users?.inactive_ecom_users ?? 0}
            </h4>
          </div>
          {/* <Badge color="success">
            <ArrowUpIcon />
            {data?.users?.new_distributors_this_month ?? 0} this month
          </Badge> */}
        </div>
      </div>





      {/* Total Orders */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Orders (E)
          </span>
        </div>
        <div className="flex items-end justify-between mt-2">
          <div>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formattedAmount(data?.orders?.total_ecom_revenue ?? 0)}
            </h4>
          </div>
        </div>
        <Badge color="success">
          {data?.orders?.total_ecom_orders ?? 0} - orders
        </Badge>
      </div>

      {/* Pending ordes */}
      <div className="rounded-2xl border border-warning-200 bg-white p-5 dark:border-warning-800 dark:bg-gray-900 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-xl dark:bg-gray-800">
          <ClipboardClock className="text-warning-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <span className="text-sm text-warning-500 dark:text-warning-400">
            All Pending Order
          </span>
        </div>
        <div className="flex items-end justify-between mt-2">
          <div>

            <h4 className="mt-2 font-bold text-warning-800 text-title-sm dark:text-white/90">
              {data?.orders?.pending_ecom_order ?? 0}
            </h4>
          </div>
        </div>
        <Badge color="success">
          {data?.orders?.ecom_delivered_orders ?? 0} - delivered
        </Badge>
      </div>


    </div>
  );
};

