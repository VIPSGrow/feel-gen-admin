"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import serverCallFuction, { formattedAmountCommas } from '@/lib/constantFunction';
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

const OrderPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'my' | 'distributor'>('all');
  const { user } = useAuth();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(filter !== 'all' && { filter })
      }).toString();

      const res: OrdersApiResponse = await serverCallFuction('GET', `api/orders?${query}`);

      if (res.success !== false && res.data) {
        setOrders(res.data);
        const pagination = res.pagination;
        setTotal(pagination.total || 0);
      } else {
        setOrders([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, filter]);

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  const getStatusColor = (status: Order['order_status'] | Order['payment_status']) => {
    switch (status) {
      case 'confirmed':
      case 'shipped':
      case 'delivered':
      case 'paid':
        return 'success' as const;
      case 'pending':
      case 'unpaid':
        return 'warning' as const;
      case 'cancelled':
        return 'error' as const;
      default:
        return 'light' as const;
    }
  };

  const totalPages = Math.ceil(total / limit);

  const getBadgeTitleColor = (status: string) => {
    switch (status) {
      case "User -> Adm.": return "success";
      case "User -> Dis.": return "primary";
      case "Dis. -> Adm.": return "warning";
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight dark:text-gray-300">Orders</h2>
          <div className=''>
            <div className="flex gap-2 bg-muted rounded-md p-1 mt-4">
              <Button
                variant={filter === 'all' ? "primary" : "outline"}
                size="sm"
                // className="flex-1"
                onClick={() => setFilter('all')}
              >
                All ( Direct + To Dist. )
              </Button>
              <Button
                variant={filter === 'my' ? "primary" : "outline"}
                size="sm"
                // className="flex-1 w-full"
                onClick={() => setFilter('my')}
              >
                Direct Orders
              </Button>


              <Button
                variant={filter === 'distributor' ? "primary" : "outline"}
                size="sm"
                // className="flex-1 w-100"
                onClick={() => setFilter('distributor')}
              >
                Distributors Orders
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
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
          <p className="text-muted-foreground">No orders found.</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border bg-white overflow-hidden">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Sr. No.</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Order ID</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Products</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">User</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Distributor</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Total</TableCell>

                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Status</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Payment Status</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {orders.map((order, index) => {

                  let badgeTitle = ""

                  if (order.user_type?.toLowerCase() === "user") {

                    if (order?.order_for?.startsWith('distributor')) {
                      badgeTitle = "User -> Dis."
                    } else {
                      badgeTitle = "User -> Adm."
                    }
                  } else {
                    badgeTitle = "Dis. -> Adm."
                  }


                  return <TableRow key={index}>
                    <TableCell className="px-6 py-4 font-bold">{(page - 1) * limit + index + 1}</TableCell>
                    <TableCell className="px-6 py-4 font-bold grid">#{order.order_id}
                      <Badge variant='solid' size='sm' color={getBadgeTitleColor(badgeTitle)} className="w-30">{badgeTitle}</Badge>
                      Date : {date_formate(order.created_at)}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-bold">{order.products?.length}</TableCell>
                    <TableCell className="px-6 py-4">
                      <div>
                        {order.user_name}
                      </div>

                      <div>
                        Ph. : <strong>{order.user_phone}</strong>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {order.distributor_id !== null && order.user_type.toLowerCase() === "user" ? <div className=''>
                        <div>{order?.distributor?.name || "-"}</div>
                        <div>{order?.distributor?.phone}</div>
                      </div> : "-"}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className='flex justify-between'>
                        <span>Subtotal:</span>
                        <span>₹{formattedAmountCommas(order.sub_total || 0)}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Tax: </span> <span>₹{formattedAmountCommas(order.tax_amount || 0)}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Shipping C.:</span> <span>₹{formattedAmount(order.shipping_charges || 0)}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Total:</span> <strong>₹{formattedAmountCommas(order.total_amount)}</strong>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge variant='solid' color={getStatusColor(order.order_status)}>
                        {order.order_status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 ">
                      <Badge variant='solid' color={getStatusColor(order.payment_status)}>
                        {order.payment_status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Button variant="outline" size="sm" onClick={() => {
                        router.push(`/orders/${order.order_id}`)
                      }}>View</Button>
                    </TableCell>
                  </TableRow>
                })}
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

export default OrderPage;
