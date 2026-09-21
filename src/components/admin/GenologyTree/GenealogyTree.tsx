"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Eye, Users } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import type { TreeUser } from "@/types/network-tree";

interface GenealogyTreeProps {
  data: TreeUser[];
  onSelect: (member: TreeUser) => void;
}

const formatCurrency = (value: unknown) => {
  const amount = Number(value || 0);
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const MemberRow = ({
  member,
  generation,
  onSelect,
}: {
  member: TreeUser;
  generation: number;
  onSelect: (member: TreeUser) => void;
}) => {
  const [expanded, setExpanded] = useState(true);
  const children = member.children || [];
  const hasChildren = children.length > 0 && generation < 7;
  const packageStatus = member.package_status || member.order_status || "Not available";
  const commission = member.commission_earned ?? member.total_commission ?? 0;

  return (
    <div className="border-l border-gray-200 pl-3 dark:border-gray-700">
      <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => hasChildren && setExpanded((value) => !value)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:cursor-default dark:hover:bg-gray-800"
          disabled={!hasChildren}
          aria-label={hasChildren ? (expanded ? "Collapse referrals" : "Expand referrals") : "No direct referrals"}
        >
          {hasChildren ? (expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />) : <Users className="size-4" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-semibold text-gray-900 dark:text-white">{member.full_name || member.username}</span>
            <Badge color={member.is_active ? "success" : "warning"}>{member.is_active ? "Active" : "Inactive"}</Badge>
            <Badge color="primary">Generation {generation}</Badge>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span>Referral: {member.referral_code || "-"}</span>
            <span>Package: {packageStatus}</span>
            <span>Commission: {formatCurrency(commission)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelect(member)}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          title="View member details"
        >
          <Eye className="size-4" />
          <span className="sm:hidden">Details</span>
        </button>
      </div>

      {expanded && hasChildren && (
        <div className="mt-3 space-y-3">
          {children.map((child) => (
            <MemberRow key={child.id} member={child} generation={generation + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

const GenealogyTree = ({ data, onSelect }: GenealogyTreeProps) => (
  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40 sm:p-6">
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Referral Genealogy</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Sponsor-based referrals through Generation 7</p>
      </div>
      <Badge color="primary">{data.length} direct referrals</Badge>
    </div>

    {data.length > 0 ? (
      <div className="space-y-3">
        {data.map((member) => (
          <MemberRow key={member.id} member={member} generation={1} onSelect={onSelect} />
        ))}
      </div>
    ) : (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-white/[0.02] dark:text-gray-400">
        No referrals found.
      </div>
    )}
  </div>
);

export default GenealogyTree;