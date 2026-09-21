"use client";
import React from "react";
import { UserIcon } from "@/icons";
import Badge from "@/components/ui/badge/Badge";

interface TreeNode {
  id: number;
  name: string;
  level: number;
  active: boolean;
  children?: TreeNode[];
}

const mockTreeData: TreeNode[] = [
  {
    id: 1,
    name: "Direct Referrals (5)",
    level: 1,
    active: true,
    children: [
      {
        id: 11,
        name: "John Doe",
        level: 1,
        active: true,
      },
      {
        id: 12,
        name: "Jane Smith",
        level: 1,
        active: true,
        children: [
          {
            id: 121,
            name: "Bob Johnson",
            level: 2,
            active: true,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Level 2 (12)",
    level: 2,
    active: true,
    children: [
      {
        id: 21,
        name: "Alice Brown",
        level: 2,
        active: false,
      },
    ],
  },
];

const ReferralTree = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl">
          <UserIcon className="size-5" />
        </div>
        <div>
          <h3 className="font-bold text-xl text-gray-800 dark:text-white/90">Referral Tree</h3>
          <p className="text-gray-500 dark:text-gray-400">Your downline hierarchy</p>
        </div>
      </div>

      <div className="space-y-4">
        {mockTreeData.map((node) => (
          <TreeNodeRender key={node.id} node={node} depth={0} />
        ))}
      </div>
    </div>
  );
};

const TreeNodeRender = ({ node, depth }: { node: TreeNode; depth: number }) => {
  return (
    <div className="ml-4 border-l-2 border-dashed border-gray-300 pl-4 dark:border-gray-600">
      <div className="flex items-center gap-3 mb-2 pb-2 border-b border-dashed border-gray-200 last:border-b-0 dark:border-gray-700">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${node.active ? 'bg-emerald-100 dark:bg-emerald-900/50 border-4 border-emerald-400' : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600'}`}>
          <UserIcon className={`size-5 mx-auto mt-1.5 ${node.active ? 'text-emerald-600' : 'text-gray-400'}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-800 dark:text-white">{node.name}</span>
            <Badge size="sm" color={node.active ? "success" : "warning"}>
              {node.active ? "Active" : "Inactive"}
            </Badge>
          </div>
          {node.level > 1 && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span>• Level {node.level}</span>
            </div>
          )}
        </div>
      </div>
      {node.children && node.children.map((child) => (
        <TreeNodeRender key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
};

export default ReferralTree;

