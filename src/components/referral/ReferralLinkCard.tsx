"use client";
import React, { useState } from "react";
import { CopyIcon, PaperPlaneIcon } from "@/icons";
import Button from "@/components/ui/button/Button";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

// import { Alert, AlertDescription } from "../../ui/alert/Alert"; // Fixed build error - simplified feedback

const ReferralLinkCard = () => {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  const referralLink = `${baseUrl.replace(/\/$/, '')}/signup?ref=${user?.referral_code}`;
  const referralCode = user?.referral_code;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrLink = `${process.env.NEXT_PUBLIC_API_URL || 'https://fsbackend.gtsol.in'}/uploads/qrcodes/${user?.referral_code}.png`

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl dark:bg-indigo-900/30">
          <PaperPlaneIcon className="text-indigo-600 size-6 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="font-bold text-xl text-gray-800 dark:text-white/90">Your Referral Link</h3>
          <p className="text-gray-500 dark:text-gray-400">Share this link to invite new members</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Referral Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Referral Code</label>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl dark:bg-gray-900/50">
            <span className="font-mono font-bold text-2xl text-gray-800 dark:text-white">{referralCode}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-9 px-3"
            >
              <CopyIcon className="size-4 mr-1" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Referral Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Shareable Link</label>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl dark:bg-gray-900/50">
            <span className="flex-1 text-sm font-mono truncate text-gray-700 dark:text-gray-300">{referralLink}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-9 px-3"
            >
              <CopyIcon className="size-4 mr-1" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* QR Code Placeholder */}
        <div className="pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-3 dark:text-gray-300">QR Code</label>
          <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50">
            <Link href={qrLink} target="_blank">
              <img src={qrLink} /></Link>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center dark:text-gray-400">Scan QR or download image</p>
        </div>

        {copied && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl dark:bg-emerald-900/30 dark:border-emerald-800">
            <div className="text-emerald-800 dark:text-emerald-200 text-sm">Referral link copied to clipboard!</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralLinkCard;

