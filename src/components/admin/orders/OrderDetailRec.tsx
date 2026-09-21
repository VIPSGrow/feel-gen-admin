"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import serverCallFuction, { date_formate, formattedAmount, formattedAmountCommas } from '@/lib/constantFunction';
import { Order } from '@/types/orders';
import { useAuth } from '@/context/AuthContext';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { Loader2, ArrowLeft, Printer, Save, CheckCircle2, PackageCheck, Wallet, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card/Card';
import Image from 'next/image';
import Input from '@/components/form/input/InputField';
import { Modal } from '@/components/ui/modal';
import TextArea from '@/components/form/input/TextArea';

const ORDER_STATUSES = ['pending', 'accepted', 'packed', 'dispatched', 'delivered', 'cancelled'] as const;
type OrderStatus = typeof ORDER_STATUSES[number];

const OrderDetailRec = () => {
    const params = useParams();
    const router = useRouter();
    const orderId = params['order-id'] as string;

    const { user, hasPermission } = useAuth();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending');
    const [remarks, setRemarks] = useState('');

    // Global action loading indicators for the return flow
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string>('');

    // Return-request modal state (Super Admin approve/reject)
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnAction, setReturnAction] = useState<'approve' | 'reject' | null>(null);
    const [adminRemarks, setAdminRemarks] = useState('');
    const [refundAmount, setRefundAmount] = useState<string>('');

    // Distributor: Return request reason modal
    const [showRequestReturnModal, setShowRequestReturnModal] = useState(false);
    const [returnReason, setReturnReason] = useState('');




    // Inside your OrderDetail component:
    const invoiceLinkRef = useRef<HTMLAnchorElement | null>(null);
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);


    const isSuperAdmin = useMemo(() => {
        return Boolean(
            hasPermission?.('orders') &&
            (user?.role?.toLowerCase() === 'super admin' ||
                user?.role_name?.toLowerCase() === 'super admin' ||
                user?.role_permissions?.includes('orders'))
        );
    }, [hasPermission, user]);

    const fetchOrder = async () => {
        if (!orderId) return;
        setLoading(true);
        setError('');
        try {
            const res = await serverCallFuction('GET', `api/orders/details/${orderId}`);
            if (res.status !== false && res.data) {
                setOrder(res.data);
                setSelectedStatus(res.data?.order_status as OrderStatus);
            } else {
                setError('Order not found');
            }
        } catch (err) {
            console.error('Error fetching order:', err);
            setError('Failed to load order');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    const getStatusColor = (status: Order['order_status'] | Order['payment_status'] | OrderStatus | string) => {
        switch (status) {
            case 'confirmed':
            case 'shipped':
            case 'delivered':
            case 'paid':
            case 'accepted':
            case 'approved':
            case 'received':
                return 'success';
            case 'pending':
            case 'unpaid':
            case 'requested':
            case 'not_initiated':
                return 'warning';
            case 'cancelled':
            case 'rejected':
                return 'error';
            default:
                return 'light';
        }
    };

    const canSetStatus = (from: OrderStatus, to: OrderStatus) => {
        const flow: Record<OrderStatus, OrderStatus[]> = {
            pending: ['delivered', 'cancelled'],
            // accepted: ['packed', 'cancelled'],
            // packed: ['dispatched', 'cancelled'],
            // dispatched: ['delivered'],
            delivered: [],
            cancelled: []
        };
        return (flow[from] || []).includes(to);
    };

    const submitStatusUpdate = async () => {
        if (!orderId || !order) return;
        // if (!isSuperAdmin) return;

        try {
            setUpdatingStatus(true);
            const payload = {
                order_status: selectedStatus,
                remarks: remarks || ''
            };

            const res = await serverCallFuction('PUT', `api/orders/${orderId}/status`, payload);
            if ((res as { status?: boolean }).status !== false) {

                setRemarks('');
                await fetchOrder();
            } else {
                setError((res as any)?.message || 'Failed to update status');
            }
        } catch (e) {
            console.error(e);
            setError('Failed to update status');
        } finally {
            setUpdatingStatus(false);
            setLoading(false);
        }
    };

    type AnyReturn = {
        id?: string | number;
        return_status?: string;
        refund_status?: string;
        admin_remarks?: string;
        refund_amount?: string | number;
        [key: string]: unknown;
    };

    type AnyOrder = Order & {
        order_status?: string;
        return_data?: AnyReturn[];
    };

    const returnData = (order as AnyOrder)?.return_data;
    const activeReturn = Array.isArray(returnData) && returnData.length > 0 ? returnData[0] : null;

    // Phase Flow Flags
    const isReturnRequested = activeReturn?.return_status === "requested";
    const isReturnApproved = activeReturn?.return_status === "approved";
    const isReturnReceived = activeReturn?.return_status === "received";
    const isRefundPending = activeReturn?.refund_status === "not_initiated";

    const openReturnModal = (action: 'approve' | 'reject') => {
        if (!order) return;
        setActionError('');
        setReturnAction(action);
        setAdminRemarks('');
        setRefundAmount('');
        setShowReturnModal(true);
    };

    const closeReturnModal = () => {
        if (actionLoading) return;
        setShowReturnModal(false);
        setReturnAction(null);
        setAdminRemarks('');
        setRefundAmount('');
        setActionError('');
    };

    // 1. Submit Approve or Reject Request
    const submitReturnAction = async () => {
        if (!orderId || !order || !activeReturn?.id || !returnAction) return;

        if (!adminRemarks.trim()) {
            setActionError('Admin remarks are required');
            return;
        }

        try {
            setActionLoading(true);
            setActionError('');

            const baseBody: { admin_remarks: string; refund_amount?: number } = {
                admin_remarks: adminRemarks.trim()
            };

            if (returnAction === 'approve') {
                const parsedRefund = refundAmount.trim() ? Number(refundAmount) : undefined;
                baseBody.refund_amount = Number.isFinite(parsedRefund) ? parsedRefund : Number(order.total_amount);
            }

            const res = await serverCallFuction('PUT', `api/orders/returns/${activeReturn.id}/${returnAction}`, baseBody);
            if ((res as any)?.status !== false) {
                setShowReturnModal(false);
                await fetchOrder();
            } else {
                setActionError((res as any)?.message || `Failed to ${returnAction} return request`);
            }
        } catch (e) {
            console.error(e);
            setActionError(`Failed to complete ${returnAction} execution`);
        } finally {
            setActionLoading(false);
        }
    };

    // 2. Mark Inventory items as Received at Warehouse
    const handleWarehouseReceive = async () => {
        if (!activeReturn?.id) return;
        try {
            setActionLoading(true);
            setActionError('');

            const res = await serverCallFuction('POST', `api/orders/returns/${activeReturn.id}/receive`, {
                received_at: new Date().toISOString()
            });

            if ((res as any)?.status !== false) {
                await fetchOrder();
            } else {
                setActionError((res as any)?.message || 'Failed to update warehouse inventory state');
            }
        } catch (e) {
            console.error(e);
            setActionError('Network processing error on inventory update');
        } finally {
            setActionLoading(false);
        }
    };

    // 3. Initiate Wallet Refund Settlement
    const handleWalletRefund = async () => {
        if (!activeReturn?.id) return;
        if (order.payment_status !== 'paid') {
            setActionError('Refunds can only be processed for orders marked as Paid');
            return;
        }

        try {
            setActionLoading(true);
            setActionError('');

            const res = await serverCallFuction('POST', `api/orders/returns/${activeReturn.id}/refund`, {
                admin_remarks: 'Wallet calculation credit applied automatically'
            });

            if ((res as any)?.status !== false) {
                await fetchOrder();
            } else {
                setActionError((res as any)?.message || 'Wallet validation settlement rejection');
            }
        } catch (e) {
            console.error(e);
            setActionError('Failed to execute wallet allocation routing');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Loading order data...</span>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="text-center py-12 space-y-4">
                <h2 className="text-xl font-bold text-destructive">{error || 'Order data reference not found'}</h2>
                <Button onClick={fetchOrder} variant="outline">Try Again</Button>
                <Button onClick={() => router.push('/orders')} variant="ghost">Back to Orders</Button>
            </div>
        );
    }

    const current = order.order_status as OrderStatus;

    return (
        <div className="space-y-6 p-6 mx-auto">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b">
                <div className="items-center gap-4 flex">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight dark:text-gray-300">Order - #{order.order_id}</h1>
                        <p className="text-sm text-muted-foreground">Placed on {date_formate(order.created_at)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="solid" color={getStatusColor(order?.order_status)} className="text-sm">
                        {order?.order_status.toUpperCase()}
                    </Badge>
                    <Badge variant="solid" color={getStatusColor(order?.payment_status)} className="text-sm">
                        {order?.payment_status.toUpperCase()}
                    </Badge>
                </div>
            </div>

            {/* ERROR DISPLAY RUNTIME RUN */}
            {actionError && (
                <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:bg-gray-900 dark:text-red-400 text-sm font-medium">
                    {actionError}
                </div>
            )}

            {/* STAGE 1: Return Requested Actions */}
            {activeReturn && isReturnRequested && (
                <div className='rounded-lg border border-warning-900 bg-warning-100 dark:bg-gray-900 text-warning-700 dark:text-gray-100 shadow-sm'>
                    <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center px-6 py-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-warning-800 dark:text-warning-400">
                                <CheckCircle2 className="h-5 w-5" /> Return Verification Requested
                            </CardTitle>
                            <CardDescription className="dark:text-gray-300">Approve allocation validation or execute hard rejection.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="primary" size="sm" disabled={actionLoading} onClick={() => openReturnModal('approve')}>
                                Approve Return
                            </Button>
                            <Button variant="outline" size="sm" className="bg-transparent" disabled={actionLoading} onClick={() => openReturnModal('reject')}>
                                Reject Request
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* STAGE 2: Return Approved -> Awaiting Warehouse Inventory Check */}
            {activeReturn && isReturnApproved && (
                <div className='rounded-lg border border-blue-900 bg-blue-50 dark:bg-gray-900 text-blue-700 dark:text-blue-400 shadow-sm'>
                    <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center px-6 py-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <PackageCheck className="h-5 w-5" /> Step 2: Awaiting Warehouse Stock Return
                            </CardTitle>
                            <CardDescription className="dark:text-gray-300">Confirm parcel reception at the logistics center to automatically restore line items back to inventory.</CardDescription>
                        </div>
                        <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={actionLoading} onClick={handleWarehouseReceive}>
                            {actionLoading ? 'Restoring Stock...' : 'Confirm Items Received'}
                        </Button>
                    </div>
                </div>
            )}

            {/* STAGE 3: Return Received -> Wallet Refund Actions Available */}
            {activeReturn && isReturnReceived && isRefundPending && (
                <div className='rounded-lg border border-purple-900 bg-purple-50 dark:bg-gray-900 text-purple-700 dark:text-purple-400 shadow-sm'>
                    <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center px-6 py-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5" /> Step 3: Pending Balance Settlement
                            </CardTitle>
                            <CardDescription className="dark:text-gray-300">
                                Inventory restored successfully. Dispatch currency distribution back to the context profile ledger wallet.
                                (Refund amount: ₹{activeReturn.refund_amount})
                            </CardDescription>
                        </div>
                        <Button variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={actionLoading || order.payment_status !== 'paid'} onClick={handleWalletRefund}>
                            {actionLoading ? 'Crediting Wallet...' : 'Release Refund to Wallet'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Historic Return Summary Banner */}
            {activeReturn && !isReturnRequested && !isReturnApproved && !(isReturnReceived && isRefundPending) && (
                <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200">
                    <CardContent className="py-4 flex flex-col md:flex-row justify-between gap-4 text-sm">
                        <div>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Return Workflow Log:</span>
                            <div className="mt-1 space-x-4 inline-block">
                                <Badge variant="outline" color={getStatusColor(activeReturn.return_status)}>
                                    Return: {(activeReturn.return_status || '').toUpperCase()}
                                </Badge>
                                <Badge variant="outline" color={getStatusColor(activeReturn.refund_status)}>
                                    Refund: {(activeReturn.refund_status || '').toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                        {activeReturn.admin_remarks && (
                            <div className="md:text-right">
                                <span className="font-medium text-muted-foreground block">Admin Audit Remark:</span>
                                <span className="italic">"{activeReturn.admin_remarks}"</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeReturn && isReturnRequested && !isSuperAdmin && (
                <div className="text-sm text-muted-foreground p-3 bg-gray-100 rounded">
                    Return requests are pending processing by a Super Administrator.
                </div>
            )}

            {/* Distributor: Request return when order is delivered (and no return exists yet) */}
            {/* {(() => {
                const updatedAt = order.updated_at ? new Date(order.updated_at) : null;
                const now = new Date();
                const isWithin30Days = updatedAt ? now.getTime() - updatedAt.getTime() <= 30 * 24 * 60 * 60 * 1000 : false;

                if (!activeReturn && order.order_status === 'delivered' && !isSuperAdmin && isWithin30Days) {
                    return (
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardContent className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div>
                                    <div className="font-semibold text-yellow-900">Return available</div>
                                    <div className="text-sm text-muted-foreground">
                                        Place a return request for this delivered order.
                                    </div>
                                </div>
                                <Button
                                    variant="primary"
                                    disabled={actionLoading}
                                    onClick={async () => {
                                        const confirmed = window.confirm("Are you sure you want to request a return for this order?");
                                        if (!confirmed) return;

                                        setActionError('');
                                        setReturnReason('');
                                        setShowRequestReturnModal(true);
                                    }}
                                >
                                    {actionLoading ? 'Requesting...' : 'Request Return'}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                }

                if (!activeReturn && order.order_status === 'delivered' && !isSuperAdmin && !isWithin30Days) {
                    return (
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardContent className="py-4">
                                <div className="font-semibold text-yellow-900">Return not available</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    Return can be requested only within 30 days from the order’s last update.
                                </div>
                            </CardContent>
                        </Card>
                    );
                }

                return null;
            })()} */}

            {/* Modal Handler Form (Distributor: Return Reason) */}
            <Modal
                className="max-w-xl"
                isOpen={showRequestReturnModal}
                onClose={() => {
                    if (actionLoading) return;
                    setShowRequestReturnModal(false);
                    setReturnReason('');
                    setActionError('');
                }}
                aria-modal="true"
            >
                <div className="p-5">
                    <h2 className="text-lg font-semibold">Request Return</h2>
                    <p className="text-sm text-muted-foreground">
                        Enter the reason for requesting this return.
                    </p>

                    <div className="my-6 ">
                        <div className="flex items-center justify-between p-2 border border-warning-200 bg-warning-50 dark:bg-warning-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                {/* <Badge color="warning" variant="solid">Action Required</Badge> */}
                                <p className="text-sm text-warning-800 font-medium">
                                    Please fill out the attached form and email it to admin@feelsafeco.in.
                                </p>
                            </div>
                            <Badge
                                color="success"
                                variant="solid"
                                className="cursor-pointer hover:bg-success-100 p-1 rounded"
                                onClick={() => {
                                    window.open(`${process.env.NEXT_PUBLIC_API_URL}/uploads/docs/RETURN-FORM.pdf`, '_blank');
                                }}
                            >
                                <Download size={14} />
                            </Badge>
                        </div>
                    </div>




                    <div className="mt-4 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Return Reason *</label>
                            <TextArea
                                placeholder="E.g., Wrong item received / Product damaged"
                                value={returnReason}
                                rows={10}
                                onChange={(value) => setReturnReason(value)}
                            ></TextArea>
                            {/* <Input
                                placeholder="E.g., Wrong item received / Product damaged"
                                value={returnReason}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReturnReason(e.target.value)}
                            /> */}
                        </div>



                        <div className="flex gap-2 pt-2">
                            <Button
                                className="flex-1"
                                variant="primary"
                                disabled={actionLoading}
                                onClick={async () => {
                                    if (!orderId) return;
                                    if (!returnReason.trim()) {
                                        setActionError('Return reason is required');
                                        return;
                                    }

                                    try {
                                        setActionLoading(true);
                                        setActionError('');

                                        const res = await serverCallFuction('POST', `api/orders/return/${order.id}/request`, {
                                            requested_at: new Date().toISOString(),
                                            reason: returnReason.trim()
                                        });

                                        if ((res as { status?: boolean })?.status === false) {
                                            setActionError((res as { message?: string })?.message || 'Failed to request return');
                                            return;
                                        }


                                        setShowRequestReturnModal(false);
                                        setReturnReason('');
                                        await fetchOrder();
                                    } catch (e) {
                                        console.error(e);
                                        setActionError('Failed to request return');
                                    } finally {
                                        setActionLoading(false);
                                    }
                                }}
                                startIcon={<Save className="h-4 w-4" />}
                            >
                                {actionLoading ? 'Requesting...' : 'Submit Request'}
                            </Button>
                            <Button
                                className="flex-1"
                                variant="outline"
                                disabled={actionLoading}
                                onClick={() => {
                                    if (actionLoading) return;
                                    setShowRequestReturnModal(false);
                                    setReturnReason('');
                                    setActionError('');
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Modal Handler Form (Super Admin approve/reject) */}
            <Modal
                className="max-w-xl"
                isOpen={showReturnModal}
                onClose={closeReturnModal}
                aria-modal="true"
            >
                <div className="p-5">
                    <h2 className="text-lg font-semibold">
                        {returnAction === 'approve' ? 'Approve Return Request' : 'Reject Return Request'}
                    </h2>
                    <p className="text-sm text-muted-foreground">Provide audit confirmation details below.</p>

                    <div className="mt-4 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Admin Remarks *</label>
                            <Input
                                placeholder="E.g., Verified product defects / Request unmatched criteria"
                                value={adminRemarks}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminRemarks(e.target.value)}
                            />
                        </div>

                        {returnAction === 'approve' && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Refund Target Value (Optional)</label>
                                <Input
                                    placeholder={`Defaults to complete order total: ₹${order?.total_amount ?? 0}`}
                                    value={refundAmount}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRefundAmount(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                            <Button
                                className="flex-1"
                                variant="primary"
                                disabled={actionLoading}
                                onClick={submitReturnAction}
                                startIcon={<Save className="h-4 w-4" />}
                            >
                                {actionLoading ? 'Processing...' : 'Confirm Submission'}
                            </Button>
                            <Button className="flex-1" variant="outline" disabled={actionLoading} onClick={closeReturnModal}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>


            {/* Information Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                        <CardDescription>Contact profiles</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Name</label>
                            <p className="font-semibold mt-1">{((order as unknown as { user_name?: string | null }).user_name) || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Phone</label>
                            <p className="font-semibold mt-1">{(order as any).user_phone || 'N/A'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span>₹{formattedAmountCommas(order.sub_total || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Tax:</span>
                            <span>₹{formattedAmount(order.tax_amount || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Shipping Charges:</span>
                            <span>₹{formattedAmount(order.shipping_charges || 0)}</span>
                        </div>

                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Total:</span>
                            <span>₹{formattedAmountCommas(order.total_amount)}</span>
                        </div>
                        {order.payment_method && (
                            <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
                                <span>Payment Method:</span>
                                <span>{order.payment_method}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Address Line</label>
                            <p className="font-semibold mt-1">
                                {order.shipping_address?.address_line1}, {order.shipping_address?.address_line2}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">City</label>
                            <p className="font-semibold mt-1">
                                {order.shipping_address?.city}, {order.shipping_address?.state}, {order.shipping_address?.pincode}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Standard Base Order Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {/* {isSuperAdmin ? ( */}
                        <div className="space-y-3 w-full">
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-sm font-semibold">Update Order Status</div>
                                <Badge variant="solid" color={getStatusColor(current)}>
                                    {current.toUpperCase()}
                                </Badge>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="grid grid-cols-3 gap-2">
                                    {(
                                        [
                                            // { label: 'Accept', value: 'accepted' },
                                            // { label: 'packed', value: 'packed' },
                                            // { label: 'dispatched', value: 'dispatched' },
                                            { label: 'delivered', value: 'delivered' },
                                            { label: 'cancelled', value: 'cancelled' }
                                        ] as const
                                    ).map((opt) => {
                                        const disabled = !canSetStatus(current, opt.value);
                                        const active = selectedStatus === opt.value;
                                        return (
                                            <Button
                                                key={opt.value}
                                                type="button"
                                                variant={active ? 'primary' : 'outline'}
                                                disabled={disabled || updatingStatus}
                                                onClick={() => setSelectedStatus(opt.value)}
                                                className="w-full"
                                            >
                                                {opt.label?.toUpperCase()}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>

                            {current !== 'delivered' && current !== 'cancelled' && (
                                <>
                                    <div className="flex flex-col gap-2">
                                        <Input
                                            placeholder="Add status remarks (optional)"
                                            value={remarks}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRemarks(e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        className="w-full"
                                        variant="primary"
                                        disabled={updatingStatus}
                                        onClick={submitStatusUpdate}
                                        startIcon={<Save className="h-4 w-4" />}
                                    >
                                        {updatingStatus ? 'Updating...' : 'Update Status'}
                                    </Button>
                                </>
                            )}
                        </div>
                        {/* ) : (
                            <div className="text-sm text-muted-foreground">Only super admins can modify core order paths.</div>
                        )} */}

                        <Button
                            className="w-full"
                            disabled={isGeneratingInvoice}
                            onClick={async () => {
                                try {
                                    setIsGeneratingInvoice(true);
                                    const res = await serverCallFuction('POST', 'api/invoice/generate', { orderId: orderId });

                                    if ((res as any).success && (res as any).url) {
                                        if (invoiceLinkRef.current) {
                                            // 1. Assign the URL to our hidden native anchor tag
                                            invoiceLinkRef.current.href = (res as any).url;
                                            // 2. Trigger a native click which browsers don't block
                                            invoiceLinkRef.current.click();
                                        }
                                    } else {
                                        alert((res as any).message || 'Failed to generate invoice');
                                    }
                                } catch (error) {
                                    console.error('Invoice error:', error);
                                    alert('An unexpected network error occurred while generating the invoice.');
                                } finally {
                                    setIsGeneratingInvoice(false);
                                }
                            }}
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            {isGeneratingInvoice ? 'Generating Invoice...' : 'Print Invoice'}
                        </Button>

                        {/* Hidden anchor tag placed safely outside layout visually */}
                        <a
                            ref={invoiceLinkRef}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden"
                            aria-hidden="true"
                        />


                    </CardContent>
                </Card>
            </div>

            {/* Products Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Items ({order.items?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {order.items && order.items.length > 0 ? (
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Product</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Qty</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Price</TableCell>
                                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Subtotal</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {order.items.map((product, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="px-6 py-4 font-bold">
                                            <div className="flex gap-3 items-center">
                                                <Image
                                                    src={product.product_image?.startsWith('http') ? product.product_image : '/images/user/user-01.jpg'}
                                                    alt={product.product_name}
                                                    width={50}
                                                    height={50}
                                                    className="rounded object-cover"
                                                    priority={false}
                                                />
                                                <div>
                                                    <div>{product.product_name}</div>
                                                    {product.variant_details && (
                                                        <div className="flex gap-2 mt-1">
                                                            {product.variant_details.attributes.map((attr, idx) => (
                                                                <Badge color="primary" key={idx}>
                                                                    {attr.value}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 font-bold">{product.qty}</TableCell>
                                        <TableCell className="px-6 py-4 font-bold">₹{formattedAmount(product.unit_price)}</TableCell>
                                        <TableCell className="px-6 py-4 font-bold">₹{formattedAmount(product.unit_price * product.qty)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No items found for this specific record tracking structure.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default OrderDetailRec;