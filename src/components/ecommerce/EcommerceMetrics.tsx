"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { ClipboardClock, Contact } from "lucide-react";
import type { DashboardData } from "@/types/dashboard";
import { formattedAmount } from "@/lib/constantFunction";

interface EcommerceMetricsProps {
  data: DashboardData | null;
  loading: boolean;
}

export const EcommerceMetrics = ({ data, loading }: EcommerceMetricsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 md:gap-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
              <div className="h-5 w-16 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            </div>
            <div className="mt-5 space-y-2">
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/2"></div>
              <div className="h-7 bg-gray-200 rounded dark:bg-gray-700 w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 md:gap-5">
      
      {/* 1. Total Distributor */}
      <div className="flex flex-col justify-between rounded-2xl border border-brand-200 bg-white p-5 dark:border-brand-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-12 h-12 bg-brand-100 rounded-xl dark:bg-brand-900/40">
            <GroupIcon className="text-brand-600 size-6 dark:text-brand-400" />
          </div>
          <Badge color="success">
            <span className="flex items-center gap-1 text-xs">
              <ArrowUpIcon className="size-3" />
              {data?.users?.new_distributors_this_month ?? 0} this month
            </span>
          </Badge>
        </div>
        <div className="mt-5">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Distributor</span>
          <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
            {data?.users?.total_distributors ?? 0}
          </h4>
        </div>
      </div>

      {/* 2. Active Distributor */}
      <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-700 size-6 dark:text-gray-300" />
          </div>
        </div>
        <div className="mt-5">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Distributor</span>
          <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
            {data?.users?.active_distributors ?? 0}
          </h4>
        </div>
      </div>

      {/* 3. In-Active Distributor */}
      <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-700 size-6 dark:text-gray-300" />
          </div>
        </div>
        <div className="mt-5">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">In-Active Distributor</span>
          <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
            {data?.users?.inactive_distributors ?? 0}
          </h4>
        </div>
      </div>

      {/* 4. KYC Approved */}
      <div className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-white p-5 dark:border-emerald-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl dark:bg-emerald-900/40">
            <Contact className="text-emerald-600 size-6 dark:text-emerald-400" />
          </div>
          <Badge color="error">
            <span className="text-xs">{data?.kyc?.pending_kyc ?? 0} pending</span>
          </Badge>
        </div>
        <div className="mt-5">
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">KYC Approved</span>
          <h4 className="mt-1 text-2xl font-bold text-emerald-800 dark:text-white">
            {data?.kyc?.approved_kyc ?? 0}
          </h4>
        </div>
      </div>

      {/* 5. Total Orders (D) */}
      <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <BoxIconLine className="text-gray-700 size-6 dark:text-gray-300" />
          </div>
          <Badge color="success">
            <span className="text-xs">{data?.orders?.total_distributor_orders ?? 0} orders</span>
          </Badge>
        </div>
        <div className="mt-5">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders (D)</span>
          <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white truncate">
            ₹{formattedAmount(data?.orders?.total_distributor_revenue ?? 0)}
          </h4>
        </div>
      </div>

      {/* 6. Total E Users */}
      <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-700 size-6 dark:text-gray-300" />
          </div>
          <Badge color="success">
            <span className="flex items-center gap-1 text-xs">
              <ArrowUpIcon className="size-3" />
              {data?.users?.new_ecom_users_this_month ?? 0} this month
            </span>
          </Badge>
        </div>
        <div className="mt-5">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total E Users</span>
          <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
            {data?.users?.total_ecom_users ?? 0}
          </h4>
        </div>
      </div>

      {/* 7. Active E Users */}
      <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-700 size-6 dark:text-gray-300" />
          </div>
        </div>
        <div className="mt-5">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active E Users</span>
          <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
            {data?.users?.active_ecom_users ?? 0}
          </h4>
        </div>
      </div>

      {/* 8. In-Active E Users */}
      <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-700 size-6 dark:text-gray-300" />
          </div>
        </div>
        <div className="mt-5">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">In-Active E Users</span>
          <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
            {data?.users?.inactive_ecom_users ?? 0}
          </h4>
        </div>
      </div>

      {/* 9. Total Orders (E) */}
      <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <BoxIconLine className="text-gray-700 size-6 dark:text-gray-300" />
          </div>
          <Badge color="success">
            <span className="text-xs">{data?.orders?.total_ecom_orders ?? 0} orders</span>
          </Badge>
        </div>
        <div className="mt-5">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders (E)</span>
          <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white truncate">
            ₹{formattedAmount(data?.orders?.total_ecom_revenue ?? 0)}
          </h4>
        </div>
      </div>

      {/* 10. Pending Orders */}
      <div className="flex flex-col justify-between rounded-2xl border border-amber-200 bg-white p-5 dark:border-amber-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl dark:bg-amber-900/40">
            <ClipboardClock className="text-amber-600 size-6 dark:text-amber-400" />
          </div>
          <Badge color="success">
            <span className="text-xs">{data?.orders?.ecom_delivered_orders ?? 0} delivered</span>
          </Badge>
        </div>
        <div className="mt-5">
          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">All Pending Order</span>
          <h4 className="mt-1 text-2xl font-bold text-amber-800 dark:text-white">
            {data?.orders?.pending_ecom_order ?? 0}
          </h4>
        </div>
      </div>

    </div>
  );
};