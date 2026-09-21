"use client";

import React, { useEffect, useMemo, useState } from "react";
import serverCallFuction, { formattedAmountCommas } from "@/lib/constantFunction";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";


type TopSellingProduct = {
    product_id?: string;
    product_name?: string;
    total_orders?: number;
    total_revenue?: string;
};

type TopDistributor = {
    distributor_id?: string;
    distributor_name?: string;
    total_orders?: number;
    total_revenue?: string;
};

type TopEcomUser = {
    ecom_user_id: string;
    ecom_user_name: string;
    total_orders: number;
    total_revenue: string;
};

type AnalyticsTopResponse = {
    success: boolean;
    data: {
        top_selling_products: TopSellingProduct[];
        top_distributors: TopDistributor[];
        top_ecom_users: TopEcomUser[];
    };
    message: string;
};

function EmptyState({ text }: { text: string }) {
    return (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/50 p-8 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
            {text}
        </div>
    );
}

function Card({
    title,
    subtitle,
    children,
    className
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string
}) {
    return (
        <section className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
            <header className="mb-4 flex flex-col gap-1">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                </h2>
                {subtitle ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                ) : null}
            </header>
            {children}
        </section>
    );
}



export default function Page() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<AnalyticsTopResponse["data"] | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchAnalytics() {
            setLoading(true);
            setError(null);

            try {
                const res = (await serverCallFuction<AnalyticsTopResponse>(
                    "GET",
                    "api/analytics/top"
                )) as AnalyticsTopResponse;

                if (!mounted) return;

                if (res?.success && res.data) {
                    setData(res.data);
                } else {
                    setError(res?.message || "Failed to fetch analytics");
                }
            } catch (e) {
                if (!mounted) return;
                setError(e instanceof Error ? e.message : "Failed to fetch analytics");
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        }

        fetchAnalytics();

        return () => {
            mounted = false;
        };
    }, []);

    const topEcomUsers = useMemo(() => data?.top_ecom_users ?? [], [data]);
    const topProducts = useMemo(
        () => data?.top_selling_products ?? [],
        [data]
    );
    const topDistributors = useMemo(
        () => data?.top_distributors ?? [],
        [data]
    );

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 p-2 sm:p-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-800 dark:bg-white/[0.03]">
                    Loading analytics...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="grid grid-cols-1 gap-4 p-2 sm:p-6">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-200">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6 p-2 sm:p-6">
            <div className="col-span-12 space-y-4 xl:col-span-12">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card title="Top Selling Products" subtitle="Based on total revenue and orders " >
                        {topProducts.length === 0 ? (
                            <EmptyState text="No top selling products available" />
                        ) : (
                            <Table>
                                <TableHeader >
                                    <TableRow className="text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                        <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Product</TableCell>
                                        <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Orders</TableCell>
                                        <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Revenue</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {topProducts.slice(0, 10).map((p, idx) => (
                                        <TableRow key={p.product_id ?? idx} className="text-sm text-gray-800 dark:text-gray-100">
                                            <TableCell className="px-4 py-3">
                                                {p.product_name ?? "—"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                {typeof p.total_orders === "number" ? p.total_orders : "—"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-brand-500 dark:text-brand-400 font-bold">
                                                {formattedAmountCommas(p.total_revenue ?? "—")}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Card>

                    <Card title="Top Distributors" subtitle="Leaders by performance">
                        {topDistributors.length === 0 ? (
                            <EmptyState text="No top distributors available" />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                        <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Distributor</TableCell>
                                        <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Orders</TableCell>
                                        <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Revenue</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {topDistributors.slice(0, 10).map((d, idx) => (
                                        <TableRow key={d.distributor_id ?? idx} className="text-sm text-gray-800 dark:text-gray-100">
                                            <TableCell className="px-4 py-3">
                                                {d.distributor_name ?? "—"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                {typeof d.total_orders === "number" ? d.total_orders : "—"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                {d.total_revenue ?? "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Card>
                </div>

                <Card title="Top Ecom Users" subtitle="Users with highest total orders and revenue">
                    {topEcomUsers.length === 0 ? (
                        <EmptyState text="No top ecom users available" />
                    ) : (
                        <Table>
                            <thead>
                                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                    <th className="bg-gray-50 px-4 py-3">User</th>
                                    <th className="bg-gray-50 px-4 py-3">Orders</th>
                                    <th className="bg-gray-50 px-4 py-3">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {topEcomUsers.slice(0, 10).map((u) => (
                                    <tr key={u.ecom_user_id} className="text-sm text-gray-800 dark:text-gray-100">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{u.ecom_user_name}</div>
                                            <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                                                {u.ecom_user_id}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{u.total_orders}</td>
                                        <td className="px-4 py-3">{u.total_revenue}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card>
            </div>
        </div>
    );
}

