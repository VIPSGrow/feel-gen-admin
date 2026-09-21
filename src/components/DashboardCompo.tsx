"use client"
import React from 'react'
import { EcommerceMetrics } from './ecommerce/EcommerceMetrics'
import QuickActionDash from './ecommerce/QuickActionDash'
import MonthlySalesChart from './ecommerce/MonthlySalesChart'
import StatisticsChart from './ecommerce/StatisticsChart'
import RecentOrders from './ecommerce/RecentOrders'
import { useDashboard } from '@/hooks/useDashboard'
import DistributorDashboard from './DistributorDashboard'
import type { DashboardData, DashboardCharts, DashboardOrder, DistributorDashboardData, DistributorCharts, DistributorRecentOrder } from '@/types/dashboard'

const DashboardCompo = () => {
    const { data, loading, isDistributor } = useDashboard()

    // If user is a Distributor, show Distributor-specific dashboard
    if (isDistributor) {
        return <DistributorDashboard data={data as DistributorDashboardData} loading={loading} />
    }

    // For admin/super admin, cast to DashboardData
    const adminData = data as DashboardData;
    const chartsData = adminData?.charts as DashboardCharts | undefined;
    const ordersData = adminData?.recent?.orders as DashboardOrder[] | undefined;

    // Otherwise show the admin dashboard
    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-12">
                <EcommerceMetrics data={adminData} loading={loading} />
                <QuickActionDash />
            </div>

            <div className="col-span-12 space-y-6 xl:col-span-12">
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6'>
                    <div className="">
                        <MonthlySalesChart data={chartsData?.daily_sales} loading={loading} />
                    </div>
                    <div className="">
                        <StatisticsChart data={chartsData?.daily_registrations} loading={loading} />
                    </div>
                </div>
            </div>


            <div className="col-span-12">
                <RecentOrders data={ordersData} loading={loading} />
            </div>
        </div>
    )
}

export default DashboardCompo
