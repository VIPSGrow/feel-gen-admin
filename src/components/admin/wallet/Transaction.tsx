"use client"
import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table/index";
import Image from 'next/image';
import Badge from '@/components/ui/badge/Badge';
import serverCallFuction, { formattedAmount } from '@/lib/constantFunction';
import { formatDate } from '@fullcalendar/core/index.js';
import type { TransactionItem } from '@/types/wallet-type';
// const transactions = [
//   {
//     id: 1,
//     date: "2024-10-15",
//     type: "Commission",
//     amount: "+$450.00",
//     customer: { image: "/images/user/user-1.jpg", name: "John Doe" },
//     daysHeld: "25/30",
//     status: "Pending"
//   },
//   {
//     id: 2,
//     date: "2024-10-10",
//     type: "Commission",
//     amount: "+$1,200.00",
//     customer: { image: "/images/user/user-2.jpg", name: "Jane Smith" },
//     daysHeld: "Mature",
//     status: "Mature"
//   },
//   {
//     id: 3,
//     date: "2024-10-08",
//     type: "Deposit",
//     amount: "+$5,000.00",
//     customer: null,
//     daysHeld: "-",
//     status: "Completed"
//   },
//   {
//     id: 4,
//     date: "2024-10-05",
//     type: "Commission Return",
//     amount: "-$150.00",
//     customer: { image: "/images/user/user-3.jpg", name: "Bob Wilson" },
//     daysHeld: "Declined",
//     status: "Declined"
//   },
//   {
//     id: 5,
//     date: "2024-10-01",
//     type: "Commission",
//     amount: "+$800.00",
//     customer: { image: "/images/user/user-4.jpg", name: "Alice Brown" },
//     daysHeld: "Mature",
//     status: "Mature"
//   }
// ];
const Transaction = ({ category = "" }) => {


  const [transactions, settransactions] = useState<TransactionItem[]>([])

  useEffect(() => {

    const fetchMetrics = async () => {
      // Simulate API call
      const res = await serverCallFuction('GET', `api/wallet/history${category && `?category=${category}`}`);
      if (res.success) {
        settransactions(res.data)
      }
    }

    fetchMetrics()

  }, []);


  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-900">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
      </div>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-gray-100 text-left">Date</TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-gray-100 text-left">Type</TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-gray-100 text-left">Amount</TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-gray-100 text-left">Commission Type</TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-gray-100 text-left">Generation</TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-gray-100 text-left">Source User</TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-gray-100 text-left">Order / Package</TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-gray-100 text-left">Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{formatDate(tx.created_at)}</TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    <Badge color={tx.type === "credit" ? "success" : "error"} variant='solid'>
                      {tx.type?.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 font-bold text-emerald-600">₹{formattedAmount(Number(tx.total_amount ?? tx.amount ?? 0))}</TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{tx.commission_type || tx.category || "Commission"}</TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{tx.generation_level ? `Generation ${tx.generation_level}` : "Direct Partner"}</TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{tx.source_user || tx.full_name || "-"}</TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{tx.order_reference || tx.remarks || "-"}</TableCell>
                  <TableCell>
                    <Badge color={(tx.commission_status || tx.status) === "mature" || (tx.commission_status || tx.status) === "completed" ? "success" : (tx.commission_status || tx.status) === "pending" ? "warning" : "error"}>
                      {tx.commission_status || tx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default Transaction
