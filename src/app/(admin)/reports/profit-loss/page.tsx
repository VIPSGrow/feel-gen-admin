"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

import serverCallFuction, { formattedAmount, getCurrencyIcon } from "@/lib/constantFunction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/Card";
import { ProfitLossResponse, ProfitLossData } from "@/types/sales-report";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Wallet,
    ShoppingCart,
    Package,
    Users,
    ArrowDownCircle,
    ArrowUpCircle,
    Percent,
    BarChart3,
    CreditCard,
    Receipt,
    RotateCcw,
} from "lucide-react";

// Dynamically import ReactApexChart to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

const ProfitLossPage = () => {
    const [reportData, setReportData] = useState<ProfitLossData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfitLoss = async () => {
            try {
                setLoading(true);
                const res = (await serverCallFuction(
                    "GET",
                    "api/reports/profit-loss"
                )) as ProfitLossResponse;

                if (res && res.success === true && res.data) {
                    setReportData(res.data);
                } else {
                    setError("Failed to fetch profit & loss report");
                }
            } catch (err) {
                setError("Error fetching profit & loss report");
            } finally {
                setLoading(false);
            }
        };

        fetchProfitLoss();
    }, []);

    // Monthly Trend Chart Options
    const getChartOptions = (): ApexOptions => ({
        colors: ["#10B981", "#EF4444", "#465FFF"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "area",
            height: 320,
            toolbar: { show: false },
        },
        stroke: {
            curve: "smooth",
            width: [2, 2, 2],
        },
        fill: {
            type: "gradient",
            gradient: {
                opacityFrom: 0.55,
                opacityTo: 0,
            },
        },
        dataLabels: { enabled: false },
        markers: {
            size: 4,
            strokeColors: "#fff",
            strokeWidth: 2,
            hover: { size: 6 },
        },
        grid: {
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
        },
        tooltip: {
            enabled: true,
            y: {
                formatter: (val: number) => `Rs.${formattedAmount(val)}`,
            },
        },
        xaxis: {
            type: "category",
            categories: reportData?.monthly_trend.map((t) => t.month) || [],
            axisBorder: { show: false },
            axisTicks: { show: false },
            tooltip: { enabled: false },
        },
        yaxis: {
            labels: {
                style: { fontSize: "12px", colors: ["#6B7280"] },
                formatter: (val: number) => `Rs.${formattedAmount(val)}`,
            },
        },
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "left",
        },
    });

    const getChartSeries = () => [
        {
            name: "Income",
            data: reportData?.monthly_trend.map((t) => parseFloat(t.income)) || [],
        },
        {
            name: "Expense",
            data: reportData?.monthly_trend.map((t) => parseFloat(t.expense)) || [],
        },
        {
            name: "Net Profit",
            data: reportData?.monthly_trend.map((t) => parseFloat(t.net_profit)) || [],
        },
    ];

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading profit & loss report...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="p-6">
                <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
                    No profit & loss data available.
                </div>
            </div>
        );
    }

    const { income, expenses, summary, monthly_trend } = reportData;
    const currency = getCurrencyIcon("INR");
    const netProfitValue = parseFloat(summary.net_profit);
    const isProfit = netProfitValue >= 0;

    const summaryCards = [
        {
            title: "Net Profit",
            value: `${currency} ${formattedAmount(Math.abs(netProfitValue))}`,
            icon: isProfit ? TrendingUp : TrendingDown,
            color: isProfit ? "text-green-600" : "text-red-600",
            bgColor: isProfit ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20",
            prefix: isProfit ? "+" : "-",
            suffix: "",
        },
        {
            title: "Total Income",
            value: `${currency} ${formattedAmount(parseFloat(summary.total_income))}`,
            icon: ArrowUpCircle,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
            prefix: "",
            suffix: "",
        },
        {
            title: "Total Expense",
            value: `${currency} ${formattedAmount(parseFloat(summary.total_expense))}`,
            icon: ArrowDownCircle,
            color: "text-rose-600",
            bgColor: "bg-rose-100 dark:bg-rose-900/20",
            prefix: "",
            suffix: "",
        },
        {
            title: "Profit Margin",
            value: summary.profit_margin,
            icon: Percent,
            color: "text-blue-600",
            bgColor: "bg-blue-100 dark:bg-blue-900/20",
            prefix: "",
            suffix: "",
        },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Profit & Loss Report
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Overview of income, expenses, and net profitability
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map((card, index) => (
                    <Card key={index} className="border-gray-200 dark:border-white/[0.05]">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                                    <card.icon className={`w-6 h-6 ${card.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {card.title}
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {card.prefix}
                                        {card.value}
                                        {card.suffix}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Income Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
                    Income Breakdown
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Order Revenue */}
                    <Card className="border-gray-200 dark:border-white/[0.05]">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Order Revenue</CardTitle>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Revenue from product orders
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/[0.05]">
                                <span className="text-gray-600 dark:text-gray-300">Total Order Revenue</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {currency} {formattedAmount(parseFloat(income.order_revenue.total_order_revenue))}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/[0.05]">
                                <span className="text-gray-600 dark:text-gray-300">Sub Total</span>
                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                    {currency} {formattedAmount(parseFloat(income.order_revenue.total_sub_total))}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/[0.05]">
                                <span className="text-gray-600 dark:text-gray-300">Tax Collected</span>
                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                    {currency} {formattedAmount(parseFloat(income.order_revenue.total_tax_collected))}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600 dark:text-gray-300">Shipping Collected</span>
                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                    {currency} {formattedAmount(parseFloat(income.order_revenue.total_shipping_collected))}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Package Revenue */}
                    <Card className="border-gray-200 dark:border-white/[0.05]">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <Package className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Package Revenue</CardTitle>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Revenue from package sales
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/[0.05]">
                                <span className="text-gray-600 dark:text-gray-300">Total Package Revenue</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {currency} {formattedAmount(parseFloat(income.package_revenue.total_package_revenue))}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600 dark:text-gray-300">Total Package Sales</span>
                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                    {income.package_revenue.total_package_sales}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Total Income Banner */}
                <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                                Total Income
                            </span>
                            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                {currency} {formattedAmount(parseFloat(income.total_income))}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Expenses Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <ArrowDownCircle className="w-5 h-5 text-rose-600" />
                    Expenses Breakdown
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Commissions */}
                    <Card className="border-gray-200 dark:border-white/[0.05]">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <Users className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Commissions</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/[0.05]">
                                <span className="text-gray-600 dark:text-gray-300">Total Commissions</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {currency} {formattedAmount(parseFloat(expenses.commissions.total_commissions))}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600 dark:text-gray-300">Transactions</span>
                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                    {expenses.commissions.total_commission_transactions}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Withdrawals */}
                    <Card className="border-gray-200 dark:border-white/[0.05]">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                                    <Wallet className="w-5 h-5 text-cyan-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Withdrawals</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/[0.05]">
                                <span className="text-gray-600 dark:text-gray-300">Total Withdrawals</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {currency} {formattedAmount(parseFloat(expenses.withdrawals.total_withdrawals))}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600 dark:text-gray-300">Transactions</span>
                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                    {expenses.withdrawals.total_withdrawal_transactions}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Refunds */}
                    <Card className="border-gray-200 dark:border-white/[0.05]">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <RotateCcw className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Refunds</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/[0.05]">
                                <span className="text-gray-600 dark:text-gray-300">Total Refunds</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {currency} {formattedAmount(parseFloat(expenses.refunds.total_refunds))}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600 dark:text-gray-300">Transactions</span>
                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                    {expenses.refunds.total_refund_transactions}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Total Expense Banner */}
                <Card className="border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-900/10">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-rose-800 dark:text-rose-200">
                                Total Expense
                            </span>
                            <span className="text-2xl font-bold text-rose-700 dark:text-rose-300">
                                {currency} {formattedAmount(parseFloat(expenses.total_expense))}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Trend Chart */}
            {monthly_trend.length > 0 && (
                <Card className="border-gray-200 dark:border-white/[0.05]">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
                                <BarChart3 className="w-5 h-5 text-brand-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Monthly Trend</CardTitle>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Income, expense, and net profit over time
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="max-w-full overflow-x-auto custom-scrollbar">
                            <div className="min-w-[600px]">
                                <ReactApexChart
                                    options={getChartOptions()}
                                    series={getChartSeries()}
                                    type="area"
                                    height={320}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ProfitLossPage;

