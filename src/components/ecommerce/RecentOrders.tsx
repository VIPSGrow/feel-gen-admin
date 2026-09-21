import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import type { DashboardOrder } from "@/types/dashboard";

interface RecentOrdersProps {
  data: DashboardOrder[] | undefined;
  loading: boolean;
}

export default function RecentOrders({ data, loading }: RecentOrdersProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="p-5 animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 w-1/4"></div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded dark:bg-gray-700"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const orders = data || [];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between pt-4 sm:px-4">
        <div className="">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
          </button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs text-white dark:text-gray-100 px-3"
              >
                Order ID
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs text-white dark:text-gray-100 px-3"
              >
                Customer
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs text-white dark:text-gray-100 px-3"
              >
                Phone
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs text-white dark:text-gray-100 px-3"
              >
                Amount
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs text-white dark:text-gray-100 px-3"
              >
                Order Status
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs text-white dark:text-gray-100 px-3"
              >
                Payment
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No recent orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="py-3 px-3">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {order.order_id}
                    </p>
                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('en-GB')}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.customer_name}
                  </TableCell>
                  <TableCell className="py-3 px-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.customer_phone}
                  </TableCell>
                  <TableCell className="py-3 px-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    ₹{order.total_amount}
                  </TableCell>
                  <TableCell className="py-3 px-3">
                    <Badge
                      size="sm"
                      color={
                        order.order_status === "delivered"
                          ? "success"
                          : order.order_status === "pending"
                            ? "warning"
                            : "error"
                      }
                    >
                      {order.order_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 px-3">
                    <Badge
                      size="sm"
                      color={
                        order.payment_status === "paid"
                          ? "success"
                          : order.payment_status === "unpaid"
                            ? "warning"
                            : "error"
                      }
                    >
                      {order.payment_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

