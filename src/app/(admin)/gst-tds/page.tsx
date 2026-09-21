"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

import serverCallFuction, { formattedAmount, date_formate, getCurrencyIcon, downloadFile } from "@/lib/constantFunction";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/Card";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { GSTReportResponse, GSTReportData } from "@/types/gst-report";
import { TdsReportResponse, TdsReportData } from "@/types/tds-report";

import {
    ShoppingCart,
    IndianRupee,
    Receipt,
    TrendingUp,
    Package,
    BarChart3,
    Users,
    Building2,
    User,
    Percent,
    CalendarClock,
    Landmark,
    FileText,
    Icon,
    Download,
} from "lucide-react";
import Button from "@/components/ui/button/Button";
import TdsReportSection from "./TdsReportSection";

// Dynamically import ReactApexChart to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

const GstTdsPage = () => {
    const [reportData, setReportData] = useState<GSTReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"gst" | "tds">("gst");

    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");

    const fetchGSTReport = async (from?: string, to?: string) => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();
            if (from) params.append("from", from);
            if (to) params.append("to", to);

            const endpoint = params.toString()
                ? `api/reports/gst?${params.toString()}`
                : "api/reports/gst";

            const res = (await serverCallFuction(
                "GET",
                endpoint
            )) as GSTReportResponse;

            if (res && res.success === true && res.data) {
                setReportData(res.data);
            } else {
                setError("Failed to fetch GST report");
            }
        } catch (err) {
            setError("Error fetching GST report");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGSTReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // Monthly Trend Chart Options
    const getChartOptions = (): ApexOptions => ({
        colors: ["#465FFF", "#10B981"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "area",
            height: 320,
            toolbar: { show: false },
        },
        stroke: {
            curve: "smooth",
            width: [2, 2],
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
        yaxis: [
            {
                title: { text: "Orders" },
                labels: {
                    style: { fontSize: "12px", colors: ["#6B7280"] },
                },
            },
            {
                opposite: true,
                title: { text: "GST Collected (Rs.)" },
                labels: {
                    style: { fontSize: "12px", colors: ["#6B7280"] },
                    formatter: (val: number) => `Rs.${formattedAmount(val)}`,
                },
            },
        ],
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "left",
        },
    });

    const getChartSeries = () => [
        {
            name: "Orders",
            data: reportData?.monthly_trend.map((t) => t.orders) || [],
        },
        {
            name: "GST Collected",
            data: reportData?.monthly_trend.map((t) => parseFloat(t.gst_collected)) || [],
        },
    ];

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading GST / TDS report...</p>
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

    const handleDownloadGstExcel = async () => {
        try {
            const params = new URLSearchParams();
            if (fromDate) params.append("from", fromDate);
            if (toDate) params.append("to", toDate);

            const qs = params.toString();
            const host: string = process.env.NEXT_PUBLIC_API_URL || 'https://backend.feelsafeco.in';

            const url = `${host}/api/reports/gst-excel${qs ? `?${qs}` : ""}`;

            const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            const token = storedToken || '';

            const header: Record<string, string> = {
                'x-auth-token': token
            };

            const response = await fetch(url, { method: 'GET', headers: header });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `GST_Report_${new Date().toLocaleDateString()}.xlsx`;
            document.body.appendChild(link);
            link.click();

            // सफाई (Cleanup)
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            alert("Excel डाउनलोड करने में समस्या आई");
        }
    }

    const currency = getCurrencyIcon("INR");

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    GST / TDS
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Tax compliance overview and reporting
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab("gst")}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "gst"
                        ? "border-brand-500 text-brand-600 dark:text-brand-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        GST
                        {activeTab === "gst" && <Badge onClick={handleDownloadGstExcel} > <Download size={10} /> </Badge>}
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab("tds")}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "tds"
                        ? "border-brand-500 text-brand-600 dark:text-brand-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4" />
                        TDS
                    </div>
                </button>
            </div>


            {/* GST Section */}
            {activeTab === "gst" && (
                <div className="space-y-6">
                    {/* Date Range Filter */}
                    <Card className="border-gray-200 dark:border-white/[0.05]">
                        <CardContent className="p-5">
                            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        From
                                    </label>
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="mt-1 px-3 py-2 border border-gray-200 dark:border-white/[0.12] rounded-lg bg-white dark:bg-black/20 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        To
                                    </label>
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="mt-1 px-3 py-2 border border-gray-200 dark:border-white/[0.12] rounded-lg bg-white dark:bg-black/20 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => fetchGSTReport(fromDate || undefined, toDate || undefined)}
                                        variant="primary"
                                    >
                                        Apply
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setFromDate("");
                                            setToDate("");
                                            fetchGSTReport();
                                        }}
                                        variant="outline"
                                    >
                                        Reset
                                    </Button>

                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {reportData ? (
                        <>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                <Card className="border-gray-200 dark:border-white/[0.05]">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                                                <ShoppingCart className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {reportData.summary.total_orders}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 dark:border-white/[0.05]">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/20">
                                                <FileText className="w-6 h-6 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Taxable Value</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {currency} {formattedAmount(parseFloat(reportData.summary.total_taxable_value))}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 dark:border-white/[0.05]">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
                                                <IndianRupee className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">GST Collected</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {currency} {formattedAmount(parseFloat(reportData.summary.total_gst_collected))}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 dark:border-white/[0.05]">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20">
                                                <Receipt className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {currency} {formattedAmount(parseFloat(reportData.summary.total_amount))}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 dark:border-white/[0.05]">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-900/20">
                                                <TrendingUp className="w-6 h-6 text-teal-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Avg GST / Order</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {currency} {formattedAmount(parseFloat(reportData.summary.avg_gst_per_order))}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* GST Split Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                                                <Percent className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-blue-700 dark:text-blue-300">Total GST</p>
                                                <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                                                    {currency} {formattedAmount(parseFloat(reportData.gst_split.total_gst))}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-800/30 rounded-lg">
                                                <Building2 className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-emerald-700 dark:text-emerald-300">CGST</p>
                                                <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                                                    {currency} {formattedAmount(parseFloat(reportData.gst_split.cgst))}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-100 dark:bg-orange-800/30 rounded-lg">
                                                <Landmark className="w-5 h-5 text-orange-700 dark:text-orange-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-orange-700 dark:text-orange-300">SGST</p>
                                                <p className="text-lg font-bold text-orange-800 dark:text-orange-200">
                                                    {currency} {formattedAmount(parseFloat(reportData.gst_split.sgst))}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                                                <Users className="w-5 h-5 text-purple-700 dark:text-purple-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-purple-700 dark:text-purple-300">IGST</p>
                                                <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
                                                    {currency} {formattedAmount(parseFloat(reportData.gst_split.igst))}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Monthly Trend Chart */}
                            {reportData.monthly_trend.length > 0 && (
                                <Card className="border-gray-200 dark:border-white/[0.05]">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
                                                <BarChart3 className="w-5 h-5 text-brand-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">Monthly GST Trend</CardTitle>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Orders and GST collection over time
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

                            {/* Tax Slabs & B2B/B2C Breakdown */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Tax Slabs */}
                                <Card className="border-gray-200 dark:border-white/[0.05]">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                                <Percent className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">Tax Slabs</CardTitle>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    GST breakdown by tax rate
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                                    <TableRow>
                                                        <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                            Tax Rate
                                                        </TableCell>
                                                        <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                            Orders
                                                        </TableCell>
                                                        <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                            Taxable Value
                                                        </TableCell>
                                                        <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                            GST Amount
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                                    {reportData.tax_slabs.length > 0 ? (
                                                        reportData.tax_slabs.map((slab, idx) => (
                                                            <TableRow key={idx}>
                                                                <TableCell className="px-4 py-3">
                                                                    <Badge size="sm" color="primary">
                                                                        {slab.tax_rate}%
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">
                                                                    {slab.total_orders}
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                                    Rs.{formattedAmount(parseFloat(slab.taxable_value))}
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300 font-semibold">
                                                                    Rs.{formattedAmount(parseFloat(slab.gst_amount))}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                                                                No tax slab data available
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* B2B / B2C Breakdown */}
                                <Card className="border-gray-200 dark:border-white/[0.05]">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                                <Users className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">B2B / B2C Breakdown</CardTitle>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Business vs Consumer transactions
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                                    <TableRow>
                                                        <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                            Type
                                                        </TableCell>
                                                        <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                            Orders
                                                        </TableCell>
                                                        <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                            Taxable Value
                                                        </TableCell>
                                                        <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                            GST Amount
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                                    {reportData.b2b_b2c_breakdown.length > 0 ? (
                                                        reportData.b2b_b2c_breakdown.map((item, idx) => (
                                                            <TableRow key={idx}>
                                                                <TableCell className="px-4 py-3">
                                                                    <Badge
                                                                        size="sm"
                                                                        color={item?.type?.toLowerCase() === "b2b" ? "primary" : "success"}
                                                                    >
                                                                        {item?.type?.toUpperCase()}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">
                                                                    {item.total_orders}
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                                    Rs.{formattedAmount(parseFloat(item.taxable_value))}
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300 font-semibold">
                                                                    Rs.{formattedAmount(parseFloat(item.gst_amount))}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                                                                No B2B/B2C data available
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Top Orders */}
                            <Card className="border-gray-200 dark:border-white/[0.05]">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                                            <ShoppingCart className="w-5 h-5 text-rose-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Top Orders by GST</CardTitle>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Orders with highest GST contribution
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                                <TableRow>
                                                    <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                        Order
                                                    </TableCell>
                                                    <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                        Customer
                                                    </TableCell>
                                                    <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                        Date
                                                    </TableCell>
                                                    <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                        Taxable Value
                                                    </TableCell>
                                                    <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                        GST Amount
                                                    </TableCell>
                                                    <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                        Total
                                                    </TableCell>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                                {reportData.top_orders.length > 0 ? (
                                                    reportData.top_orders.map((order) => (
                                                        <TableRow key={order.order_id}>
                                                            <TableCell className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Package className="w-4 h-4 text-gray-400" />
                                                                    <span className="font-medium text-gray-800 dark:text-white">
                                                                        #{order.order_number}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                                {order.customer_name}
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                                {date_formate(order.order_date)}
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                                Rs.{formattedAmount(parseFloat(order.taxable_value))}
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300 font-semibold">
                                                                Rs.{formattedAmount(parseFloat(order.gst_amount))}
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300 font-semibold">
                                                                Rs.{formattedAmount(parseFloat(order.total_amount))}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                                                            No top order data available
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* By Product */}
                            <Card className="border-gray-200 dark:border-white/[0.05]">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                                            <Package className="w-5 h-5 text-cyan-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">GST by Product</CardTitle>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Product-wise GST contribution
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                                <TableRow>
                                                    <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                        Product
                                                    </TableCell>
                                                    <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                        Orders
                                                    </TableCell>
                                                    <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                        Qty Sold
                                                    </TableCell>
                                                    <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                        Taxable Value
                                                    </TableCell>
                                                    <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                        GST Amount
                                                    </TableCell>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                                {reportData.by_product.length > 0 ? (
                                                    reportData.by_product.map((product) => (
                                                        <TableRow key={product.product_id}>
                                                            <TableCell className="px-4 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                                        <Package className="w-4 h-4 text-gray-500" />
                                                                    </div>
                                                                    <div>
                                                                        <span className="block font-medium text-gray-800 dark:text-white">
                                                                            {product.product_name}
                                                                        </span>
                                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                            ID: #{product.product_id}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">
                                                                {product.total_orders}
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                                {product.total_qty_sold}
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                                Rs.{formattedAmount(parseFloat(product.taxable_value))}
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300 font-semibold">
                                                                Rs.{formattedAmount(parseFloat(product.gst_amount))}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                                                            No product data available
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
                            No GST data available.
                        </div>
                    )}
                </div>
            )}

            {/* TDS Section */}
            {activeTab === "tds" && (
                <TdsReportSection
                    fromDate={fromDate}
                    toDate={toDate}
                    setFromDate={setFromDate}
                    setToDate={setToDate}
                    currency={currency}
                />
            )}

        </div>
    );
};

export default GstTdsPage;

