"use client";
import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table/index";
import Badge from "@/components/ui/badge/Badge";

interface Referral {
  id: number;
  avatar: string;
  name: string;
  email: string;
  joinedDate: string;
  level: string;
  status: string;
  commission: string;
}

const mockReferrals: Referral[] = [
  {
    id: 1,
    avatar: "/images/user/user-17.jpg",
    name: "John Doe",
    email: "john@example.com",
    joinedDate: "2024-01-15",
    level: "Level 1",
    status: "Active",
    commission: "$250",
  },
  {
    id: 2,
    avatar: "/images/user/user-18.jpg",
    name: "Jane Smith",
    email: "jane@example.com",
    joinedDate: "2024-02-10",
    level: "Level 1",
    status: "Pending",
    commission: "$0",
  },
  {
    id: 3,
    avatar: "/images/user/user-19.jpg",
    name: "Bob Johnson",
    email: "bob@example.com",
    joinedDate: "2024-03-05",
    level: "Level 2",
    status: "Active",
    commission: "$450",
  },
  {
    id: 4,
    avatar: "/images/user/user-20.jpg",
    name: "Alice Brown",
    email: "alice@example.com",
    joinedDate: "2024-03-20",
    level: "Level 1",
    status: "Active",
    commission: "$180",
  },
  {
    id: 5,
    avatar: "/images/user/user-21.jpg",
    name: "Charlie Wilson",
    email: "charlie@example.com",
    joinedDate: "2024-04-01",
    level: "Level 3",
    status: "Active",
    commission: "$1,200",
  },
];

const ReferralTable = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-xl text-gray-800 dark:text-white/90 mb-6">Direct Referrals</h3>
      {/* Note: BasicTableOne doesn't accept data prop; using mock inline for demo. Adapt BasicTableOne for reusability later */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">User</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Email</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Joined</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Level</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Status</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Commission</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {mockReferrals.map((ref) => (
                  <TableRow key={ref.id}>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                          <img src={ref.avatar} alt={ref.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-medium text-gray-800 dark:text-white">{ref.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{ref.email}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{ref.joinedDate}</TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge color="primary">{ref.level}</Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge color={ref.status === 'Active' ? 'success' : 'warning'}>{ref.status}</Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-semibold text-gray-800 dark:text-white">{ref.commission}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralTable;

