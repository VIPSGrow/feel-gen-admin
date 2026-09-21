"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import serverCallFuction, { formattedAmountCommas } from "@/lib/constantFunction";
import { AlertCircle, Landmark, ShieldCheck, Wallet2 } from "lucide-react";

type DownlineUser = { id: string; name: string };

const TransferFund = ({ closeModal }) => {
  const { user } = useAuth();
  const { walletData } = useWallet();

  const [downlines, setDownlines] = useState<DownlineUser[]>([]);
  const [toUserId, setToUserId] = useState<string>("");

  const [uvAmount, setUvAmount] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>("Transfer request");
  const [transactionPin, setTransactionPin] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const UV_RATE = 10;
  const amount = uvAmount * UV_RATE; // send INR amount (UV * 10)

  // walletData in context is typed loosely (WalletItem[]). Defensively extract total_balance.
  const currentBalance = useMemo(() => {
    const w: unknown = walletData;
    console.log("wallet amount in D-D = ", w);

    const arr = Array.isArray(w) ? w : [];
    const first = arr.length > 0 ? (arr[0] as any) : (w as any);
    const total = first?.withdrawable_amount ?? first?.withdrawable_amount;
    const n = total === undefined || total === null ? 0 : parseFloat(String(total));
    return Number.isFinite(n) ? n : 0;
  }, [walletData]);

  // Fetch downlines for dropdown
  useEffect(() => {
    const fetchDownline = async () => {
      try {
        const res = await serverCallFuction("GET", `api/users/downline`);
        if (res?.success && Array.isArray(res.data)) {
          const mapped: DownlineUser[] = res.data
            .map((d: any) => ({
              id: String(d.id ?? d.user_id ?? ""),
              name: String(d.name ?? d.full_name ?? d.username ?? ""),
            }))
            .filter((x: DownlineUser) => x.id && x.name);

          const selfId = user?.id ? String(user.id) : "";
          const selfName = (user as any)?.name ?? (user as any)?.full_name ?? "My Self";

          const withSelf: DownlineUser[] = [
            ...(selfId ? [{ id: selfId, name: selfName }] : []),
            ...mapped,
          ];

          setDownlines(withSelf);
          if (!toUserId && selfId) setToUserId(selfId);
        }
      } catch (e) {
        console.error("Downline fetch error:", e);
      }
    };

    fetchDownline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Validation Error Handling
  useEffect(() => {
    if (uvAmount <= 0) {
      setError(null);
      return;
    }
    if (currentBalance <= 0) {
      setError("Your current balance is 0. You cannot initiate a transfer.");
    } else if (uvAmount > currentBalance) {
      setError(`Insufficient funds! You only have ${currentBalance} UV available.`);
    } else {
      setError(null);
    }
  }, [uvAmount, currentBalance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user?.kyc_status === false) {
      alert("Please complete your KYC verification before making a transfer.");
      return;
    }

    if (!toUserId) {
      alert("Please select a recipient.");
      return;
    }

    if (currentBalance <= 0 || uvAmount > currentBalance) {
      alert("Invalid transfer amount. Please check your available balance.");
      return;
    }

    if (transactionPin.length < 4) {
      alert("Please enter a valid transaction PIN.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await serverCallFuction("POST", `api/transactions/transfer`, {
        toUserId,
        amount, // INR amount
        remarks,
        pin: transactionPin,
      });

      if (res?.success) {
        alert(res.message ?? "Transfer successful");
        closeModal()
      } else {
        setError(res?.message || res?.error || "Transfer failed");
      }
    } catch (err) {
      console.error("Transfer error:", err);
      setError("Transfer failed due to a network/server error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled =
    isSubmitting ||
    !uvAmount ||
    uvAmount <= 0 ||
    currentBalance <= 0 ||
    uvAmount > currentBalance ||
    !user?.kyc_status ||
    !toUserId ||
    transactionPin.length === 0;





  return (
    <div className="mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      {!user?.kyc_status && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-amber-700 text-sm">
          <AlertCircle className="shrink-0" size={18} />
          <p>Your KYC is pending. Please complete your KYC verification to enable transfers.</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 text-red-700 text-sm">
          <AlertCircle className="shrink-0" size={18} />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Balance Display */}
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center gap-4">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Wallet2 size={20} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Current Withdrawable Balance</p>
          </div>
          <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded font-bold">
            {formattedAmountCommas(currentBalance)} UV
          </span>
        </div>

        {/* To User Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transfer To (Downline)
          </label>
          <select
            value={toUserId}
            onChange={(e) => setToUserId(e.target.value)}
            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none transition-all"
            required
          >
            <option value="">Select downline</option>
            {downlines.length > 0 ? (
              downlines.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))
            ) : (
              <option disabled>No downlines found</option>
            )}
          </select>
        </div>

        {/* UV Amount Input Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount to Transfer (UV)
          </label>
          <div className="relative">
            <input
              type="number"
              value={uvAmount || ""}
              onChange={(e) => setUvAmount(Math.max(0, Number(e.target.value)))}
              placeholder="Enter UV amount"
              className={`w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border ${error ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-700 focus:ring-brand-500"
                } rounded-xl outline-none transition-all`}
              required
            />
            <span className="absolute right-4 top-3.5 text-gray-400 font-medium">UV</span>
          </div>
        </div>

        {/* Financial Breakdown (Without TDS) */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 uppercase">Total Transfer Amount</p>
            <p className="text-2xl font-bold text-brand-600">₹{amount.toLocaleString()}</p>
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Remarks</label>
          <input
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter remarks"
            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none transition-all"
          />
        </div>

        {/* Linked Bank Information Preview */}
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center gap-4">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Landmark size={20} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{(user as any)?.bank_name || "No Bank Linked"}</p>
            <p className="text-xs text-gray-500">Acc: {(user as any)?.account_no || "0000"}</p>
            <p className="text-xs text-gray-500">Holder: {(user as any)?.account_holder_name || "N/A"}</p>
            <p className="text-xs text-gray-500">Routing/IFSC: {(user as any)?.ifsc_code || "N/A"}</p>
          </div>
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold uppercase">Verified</span>
        </div>

        {/* Transaction PIN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transaction PIN</label>
          <div className="relative">
            <input
              type="password"
              maxLength={4}
              value={transactionPin}
              onChange={(e) => setTransactionPin(e.target.value)}
              placeholder="••••"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all tracking-widest"
              required
            />
            <ShieldCheck className="absolute left-3 top-3.5 text-gray-400" size={18} />
          </div>
        </div>

        <button
          type="submit"
          disabled={isButtonDisabled}
          className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 disabled:shadow-none text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all transform active:scale-[0.98]"
        >
          {isSubmitting ? "Processing..." : "Confirm Transfer"}
        </button>
      </form>
    </div>
  );
};

export default TransferFund;