"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card/Card";

import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CalendarClock, Download, File } from "lucide-react";

import serverCallFuction, { formattedAmount, downloadFile } from "@/lib/constantFunction";


import { TdsReportData, TdsReportResponse } from "@/types/tds-report";

import { date_formate } from "@/lib/constantFunction";

type Props = {
    fromDate: string;
    toDate: string;
    setFromDate: React.Dispatch<React.SetStateAction<string>>;
    setToDate: React.Dispatch<React.SetStateAction<string>>;
    currency: string;
};

const TdsReportSection = ({
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    currency,
}: Props) => {
    const [data, setData] = useState<TdsReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const buildTdsUrl = (from?: string, to?: string) => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);

        const qs = params.toString();
        return qs ? `api/reports/tds?${qs}` : "api/reports/tds";
    };

    const buildTdsExcelUrl = (from?: string, to?: string) => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);

        const qs = params.toString();
        return qs
            ? `api/reports/tds-excel?${qs}`
            : "api/reports/tds-excel";
    };

    const fetchTds = async (from?: string, to?: string) => {
        try {
            setLoading(true);
            setError("");

            const endpoint = buildTdsUrl(from, to);
            const res = (await serverCallFuction(
                "GET",
                endpoint
            )) as TdsReportResponse;

            if (res && res.success === true && res.data) {
                setData(res.data);
            } else {
                setError(res?.message || "Failed to fetch TDS report");
            }
        } catch (e) {
            const message = e instanceof Error ? e.message : "Error fetching TDS report";
            setError(message);

        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch only on initial load (matches GST behavior expectation)
    // but only when user actually opens the TDS tab, which is ensured by parent rendering.
    useEffect(() => {
        // If user just navigated to TDS and there are no dates applied, fetch default.
        fetchTds(fromDate || undefined, toDate || undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDownloadTdsExcel = async () => {
        try {
            const url = buildTdsExcelUrl(fromDate || undefined, toDate || undefined);
            const response = await downloadFile("GET", url);

            if (response instanceof Blob) {
                const downloadUrl = window.URL.createObjectURL(response);
                const link = document.createElement("a");
                link.href = downloadUrl;
                link.download = `TDS_Report_${new Date().toLocaleDateString()}.xlsx`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(downloadUrl);
            } else {
                throw new Error("Download failed");
            }
        } catch {
            alert("Excel डाउनलोड करने में समस्या आई");
        }
    };

    const summary = useMemo(() => data?.summary, [data]);

    return (
        <div className="space-y-6">
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
                                onClick={() => fetchTds(fromDate || undefined, toDate || undefined)}
                                variant="primary"
                            >
                                Apply
                            </Button>
                            <Button
                                onClick={() => {
                                    setFromDate("");
                                    setToDate("");
                                    fetchTds();
                                }}
                                variant="outline"
                            >
                                Reset
                            </Button>

                            <Button
                                onClick={handleDownloadTdsExcel}
                                variant="primary"
                                className="whitespace-nowrap"
                            >
                                Export Excel
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {loading && (
                <div className="p-6 flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">
                            Loading TDS report...
                        </p>
                    </div>
                </div>
            )}

            {!loading && error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {!loading && !error && data && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className="border-gray-200 dark:border-white/[0.05]">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                                        <CalendarClock className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Total Transactions
                                        </p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                                            {summary?.total_transactions ?? 0}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200 dark:border-white/[0.05] sm:col-span-2">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
                                        <span className="text-green-600 text-2xl">₹</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Total Amount
                                        </p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                                            {currency} {formattedAmount(parseFloat(summary?.total_amount || "0"))}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge color="primary">Transactions</Badge>
                    </div>

                    <Card className="border-gray-200 dark:border-white/[0.05]">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            {/* <TableCell className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                Transaction ID
                                            </TableCell> */}
                                            <TableCell className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                Date
                                            </TableCell>
                                            <TableCell className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                Full Name
                                            </TableCell>
                                            <TableCell className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                Amount
                                            </TableCell>
                                            <TableCell className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                Category
                                            </TableCell>
                                            <TableCell className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                Type
                                            </TableCell>
                                            <TableCell className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                Remarks
                                            </TableCell>
                                            <TableCell className="px-4 py-3 font-semibold text-gray-100 dark:text-white text-left">
                                                Action
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {data.transactions.length > 0 ? (
                                            data.transactions.map((tx, idx) => (
                                                <TableRow key={`${tx.transaction_id}-${idx}`}>
                                                    {/* <TableCell className="px-4 py-3">
                                                        #{tx.id}
                                                    </TableCell> */}
                                                    <TableCell className="px-4 py-3">
                                                        {tx.created_at ? date_formate(tx.created_at) : "-"}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 ">
                                                        <div>{tx.user_name}</div>
                                                        <Badge>{tx.user_phone}</Badge>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 font-semibold">
                                                        {currency} {formattedAmount(parseFloat(tx.amount || "0"))}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        {tx.category}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        {tx.type}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        {tx.remarks}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        <Badge
                                                            onClick={async () => {
                                                                try {
                                                                    const remarks = tx.remarks ?? "";
                                                                    const parts = remarks.split("_");
                                                                    const cycleKey = parts[1] ?? "";

                                                                    if (!cycleKey) {
                                                                        alert("Invalid cycle key");
                                                                        return;
                                                                    }

                                                                    const endpoint = "api/reports/commission-tds/bill-pdf";
                                                                    const response = await serverCallFuction("POST", endpoint, {
                                                                        cycleKey,
                                                                        force: true,
                                                                    });


                                                                    if (response.success) {
                                                                        const downloadUrl = response.url;

                                                                        const link = document.createElement('a');
                                                                        link.href = downloadUrl;
                                                                        link.target = "_blank";
                                                                        link.download = `Commission_BILL_TDS_${new Date().toLocaleDateString()}.pdf`;
                                                                        document.body.appendChild(link);
                                                                        link.click();

                                                                        // सफाई (Cleanup)
                                                                        link.remove();
                                                                        window.URL.revokeObjectURL(downloadUrl);

                                                                    }

                                                                    // if (response instanceof Blob) {
                                                                    //     const downloadUrl = window.URL.createObjectURL(response);
                                                                    //     const link = document.createElement("a");
                                                                    //     link.href = downloadUrl;
                                                                    //     link.download = `TDS_Bill_${cycleKey}.pdf`;
                                                                    //     document.body.appendChild(link);
                                                                    //     link.click();
                                                                    //     link.remove();
                                                                    //     window.URL.revokeObjectURL(downloadUrl);
                                                                    // } else {
                                                                    //     alert("Bill pdf download failed");
                                                                    // }
                                                                } catch (e) {
                                                                    const message = e instanceof Error ? e.message : "Bill pdf download failed";
                                                                    alert(message);
                                                                }
                                                            }}
                                                        >
                                                            <File />
                                                        </Badge>
                                                    </TableCell>

                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                    No TDS transactions found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )
            }

            {
                !loading && !error && !data && (
                    <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
                        No TDS data available.
                    </div>
                )
            }
        </div >
    );
};

export default TdsReportSection;

