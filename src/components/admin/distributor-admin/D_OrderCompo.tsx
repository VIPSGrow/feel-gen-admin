"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import serverCallFuction from '@/lib/constantFunction';
import { Order, OrdersApiResponse } from '@/types/orders';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formattedAmount } from '@/lib/constantFunction';
import { date_formate } from '@/lib/constantFunction';
import { PurchaseRecord } from '@/types/user-package';

const D_OrderCompo = () => {
    const [orders, setOrders] = useState<PurchaseRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search })
            }).toString();

            const res: OrdersApiResponse = await serverCallFuction('GET', `api/plan/distributor-orders?${query}`);

            if (res.status !== false && res.data) {
                setOrders(res.data);
                setTotal(res.total || 0);
            } else {
                setOrders([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('Error fetching distributor orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, search]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const getStatusColor = (status: Order['order_status'] | Order['payment_status']) => {
        switch (status) {
            case 'confirmed':
            case 'shipped':
            case 'delivered':
            case 'paid':
            case 'wallet':
                return 'success' as const;
            case 'pending':
            case 'unpaid':
            case 'rezorpay':
                return 'warning' as const;
            case 'cancelled':
                return 'error' as const;
            default:
                return 'light' as const;
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight dark:text-gray-300">Distributor Orders</h2>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search distributor orders..."
                            defaultValue={search}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                            className="pl-10 w-64"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No distributor orders found.</p>
                </div>
            ) : (
                <>
                    <div className="rounded-md border bg-white dark:bg-gray-900">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-100 text-left">Order ID</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-100 text-left">Package Details</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-100 text-left">User Details</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-100 text-left">Purchase Date</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-100 text-left">Total</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-100 text-left">Status</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-100 text-left">Payment Method</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-100 text-left">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {orders.map((order, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="px-6 py-4 font-bold dark:text-gray-100">#{order.order_id || "N/A"}</TableCell>
                                        <TableCell className="px-6 py-4">
                                            {order.package_details ? (
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="font-bold text-gray-900 dark:text-gray-100">
                                                        {order.package_details.name}
                                                    </span>
                                                    <Badge variant="solid" >
                                                        ₹{Number(order.package_details.price).toLocaleString()}
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            {order.user_data ? (
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="font-bold text-gray-900 dark:text-gray-100">
                                                        {order.user_data.full_name}
                                                    </span>
                                                    <span className="font-bold text-gray-900 dark:text-gray-100">
                                                        {order.user_data.phone}
                                                    </span>
                                                    <span className="font-bold text-gray-900 dark:text-gray-100">
                                                        {order.user_data.email}
                                                    </span>
                                                    {/* <Badge variant="solid" >
                                                        ₹{Number(order.package_details.price).toLocaleString()}
                                                    </Badge> */}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 dark:text-gray-100">{date_formate(order.purchased_at)}</TableCell>
                                        <TableCell className="px-6 py-4 dark:text-gray-100">
                                            <div>Amount: ₹{formattedAmount(order.amount || 0)}</div>
                                            {/* <div>Tax: ₹{formattedAmount(order.tax_amount || 0)}</div>
                                            Total: <strong>₹{formattedAmount(order.total_amount)}</strong> */}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge variant='solid' color={getStatusColor(order.status)}>
                                                {order.status?.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 dark:text-gray-100">
                                            <Badge variant='solid' color={getStatusColor(order.payment_method)}>
                                                {order.payment_method?.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Button variant="outline" size="sm">
                                                <Link
                                                    // href={`/distributor-orders/${order.order_id}`}
                                                    href={"#"}
                                                    className="text-inherit hover:text-inherit"
                                                >
                                                    View
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-2">
                            <div className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                    disabled={page === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default D_OrderCompo;
