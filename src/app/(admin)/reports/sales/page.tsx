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
import { SalesReportResponse, SalesReportData } from "@/types/sales-report";
import {
    ShoppingCart,
    IndianRupee,
    Receipt,
    Truck,
    Award,
    TrendingUp,
    Package,
    CreditCard,
    BarChart3,
    Download,
} from "lucide-react";
import Button from "@/components/ui/button/Button";
import { useAuth } from "@/context/AuthContext";

// Dynamically import ReactApexChart to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

const SalesReportPage = () => {
    const [reportData, setReportData] = useState<SalesReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user } = useAuth()

    useEffect(() => {
        const fetchSalesReport = async () => {
            try {
                setLoading(true);
                let url = `api/reports/distributor-sales`;
                if (user?.role?.toLocaleLowerCase() === "super admin") {
                    url = `api/reports/sales`;
                }
                const res = (await serverCallFuction(
                    "GET",
                    url
                )) as SalesReportResponse;

                if (res && res.success === true && res.data) {
                    setReportData(res.data);
                } else {
                    setError("Failed to fetch sales report");
                }
            } catch (err) {
                setError("Error fetching sales report");
            } finally {
                setLoading(false);
            }
        };

        fetchSalesReport();
    }, []);

    // Daily Trend Chart Options
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
            x: { format: "dd MMM yyyy" },
        },
        xaxis: {
            type: "category",
            categories: reportData?.daily_trend.map((t) =>
                date_formate(t.date)
            ) || [],
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
                title: { text: "Revenue (Rs.)" },
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
            data: reportData?.daily_trend.map((t) => t.orders) || [],
        },
        {
            name: "Revenue",
            data: reportData?.daily_trend.map((t) => parseFloat(t.revenue)) || [],
        },
    ];

    const getStatusBadgeColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "warning";
            case "processing":
                return "info";
            case "shipped":
                return "primary";
            case "delivered":
                return "success";
            case "cancelled":
                return "error";
            case "paid":
                return "success";
            case "unpaid":
                return "error";
            case "partial":
                return "warning";
            default:
                return "light";
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading sales report...</p>
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
                    No sales data available.
                </div>
            </div>
        );
    }

    const { summary, status_breakdown, payment_status_breakdown, daily_trend, top_products } = reportData;

    const summaryCards = [
        {
            title: "Total Orders",
            value: summary.total_orders,
            icon: ShoppingCart,
            color: "text-blue-600",
            bgColor: "bg-blue-100 dark:bg-blue-900/20",
            prefix: "",
            suffix: "",
        },
        {
            title: "Total Revenue",
            value: `${getCurrencyIcon('INR')} ${formattedAmount(parseFloat(summary.total_revenue))}`,
            icon: IndianRupee,
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900/20",
            prefix: "",
            suffix: "",
        },
        {
            title: "Total Tax",
            value: `${getCurrencyIcon('INR')} ${formattedAmount(parseFloat(summary.total_tax))}`,
            icon: Receipt,
            color: "text-purple-600",
            bgColor: "bg-purple-100 dark:bg-purple-900/20",
            prefix: "",
            suffix: "",
        },
        {
            title: "Total Shipping",
            value: `${getCurrencyIcon('INR')} ${formattedAmount(parseFloat(summary.total_shipping))}`,
            icon: Truck,
            color: "text-orange-600",
            bgColor: "bg-orange-100 dark:bg-orange-900/20",
            prefix: "",
            suffix: "",
        },
        // {
        //     title: "Total BV Points",
        //     value: summary.total_bv_points,
        //     icon: Award,
        //     color: "text-pink-600",
        //     bgColor: "bg-pink-100 dark:bg-pink-900/20",
        //     prefix: "",
        //     suffix: " pts",
        // },
        {
            title: "Avg Order Value",
            value: `${getCurrencyIcon('INR')} ${formattedAmount(parseFloat(summary.avg_order_value))}`,
            icon: TrendingUp,
            color: "text-teal-600",
            bgColor: "bg-teal-100 dark:bg-teal-900/20",
            prefix: "",
            suffix: "",
        },
    ];


    const handleDownloadSalesExcel = async () => {
        try {
            // अपनी API का URL (with dates)
            // const url = `https://backend.feelsafeco.in/api/reports/sales-excel`;
            let url = `api/reports/sales-excel`;
            if (user?.role == 'Super Admin') {
                url = `api/reports/sales-excel`;
            } else {
                url = `api/reports/sales-d-excel`;
            }

            // const response = await fetch(url, { method: 'GET' });
            // if (!response.ok) throw new Error('Download failed');

            // const blob = await response.blob();

            const response = await downloadFile('GET', url);
            if (response instanceof Blob) {
                const downloadUrl = window.URL.createObjectURL(response);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `Sales_Report_${new Date().toLocaleDateString()}.xlsx`;
                document.body.appendChild(link);
                link.click();

                // सफाई (Cleanup)
                link.remove();
                window.URL.revokeObjectURL(downloadUrl);
            } else {
                throw new Error('Download failed');
            }


        } catch (error) {
            alert("Excel डाउनलोड करने में समस्या आई - ", error);
        }
    }


    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Sales Report
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Overview of your sales performance and metrics
                    </p>
                </div>

                <Button variant="primary"
                    size="sm"
                    onClick={handleDownloadSalesExcel}
                    className="ml-auto"
                    startIcon={<Download className="w-4 h-4" />}
                >
                    Export in Excel
                </Button>
            </div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
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

            {/* Daily Trend Chart */}
            {daily_trend.length > 0 && (
                <Card className="border-gray-200 dark:border-white/[0.05]">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
                                <BarChart3 className="w-5 h-5 text-brand-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Daily Sales Trend</CardTitle>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Orders and revenue over time
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

            {/* Status & Payment Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status Breakdown */}
                <Card className="border-gray-200 dark:border-white/[0.05]">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Order Status Breakdown</CardTitle>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Orders grouped by status
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
                                            Status
                                        </TableCell>

                                        <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                            Count
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                            Revenue
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {status_breakdown.length > 0 ? (
                                        status_breakdown.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="px-4 py-3">
                                                    <Badge
                                                        size="sm"
                                                        color={getStatusBadgeColor(item.order_status)}
                                                    >
                                                        {item.order_status.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">
                                                    {item.count}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                    Rs.{formattedAmount(parseFloat(item.revenue))}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="text-center py-6 text-gray-500"
                                            >
                                                No status data available
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Status Breakdown */}
                <Card className="border-gray-200 dark:border-white/[0.05]">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <CreditCard className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Payment Status Breakdown</CardTitle>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Orders grouped by payment status
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
                                            Payment Status
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                            Payment Method
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                            Count
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                            Revenue
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {payment_status_breakdown.length > 0 ? (
                                        payment_status_breakdown.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="px-4 py-3">
                                                    <Badge
                                                        size="sm"
                                                        color={getStatusBadgeColor(item.payment_status)}
                                                    >
                                                        {item.payment_status.toUpperCase()}
                                                    </Badge>
                                                </TableCell><TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">
                                                    {item?.payment_method?.toUpperCase()}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">
                                                    {item.count}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                    Rs.{formattedAmount(parseFloat(item.revenue))}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="text-center py-6 text-gray-500"
                                            >
                                                No payment status data available
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Products */}
            <Card className="border-gray-200 dark:border-white/[0.05]">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <Package className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Top Products</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Best-selling products by quantity and revenue
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">
                                        Product
                                    </TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">
                                        Qty Sold
                                    </TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">
                                        Orders
                                    </TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">
                                        Revenue
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {top_products.length > 0 ? (
                                    top_products.map((product) => (
                                        <TableRow key={product.product_id}>
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-gray-500" />
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
                                            <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                                                {product.total_qty_sold}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                {product.total_orders}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 font-semibold">
                                                Rs.{formattedAmount(parseFloat(product.total_revenue))}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            No product data available
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SalesReportPage;

