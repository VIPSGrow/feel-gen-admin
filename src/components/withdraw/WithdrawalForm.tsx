"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Wallet, Landmark, ShieldCheck, AlertCircle, Wallet2 } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import serverCallFuction, { formattedAmountCommas } from "@/lib/constantFunction";


const WithdrawalForm = ({ close }: { close: () => void }) => {

  const { user } = useAuth();
  const { walletData } = useWallet();
  const [uvAmount, setUvAmount] = useState<number>(0);
  const [transactionPin, setTransactionPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Constants
  const UV_RATE = 10;
  const inrAmount = uvAmount * UV_RATE;



  // Parse wallet balance safely as a number
  const currentBalance =
    walletData &&
      !Array.isArray(walletData) &&
      typeof (walletData as { withdrawable_amount?: string }).withdrawable_amount !== "undefined"
      ? parseFloat((walletData as { withdrawable_amount?: string }).withdrawable_amount as string)
      : 0;




  // Real-time Validation Error Handling
  useEffect(() => {
    if (uvAmount <= 0) {
      setError(null);
    } else if (currentBalance <= 0) {
      setError("Your current balance is 0. You cannot initiate a withdrawal.");
    } else if (uvAmount > currentBalance) {
      setError(`Insufficient funds! You only have ${currentBalance} UV available.`);
    } else {
      setError(null);
    }
  }, [uvAmount, currentBalance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard clause for KYC validation
    if (user?.kyc_status === false) {
      alert("Please complete your KYC verification before making a withdrawal.");
      return;
    }

    // Safety guard clause for balance enforcement
    if (currentBalance <= 0 || uvAmount > currentBalance) {
      alert("Invalid withdrawal amount. Please check your available balance.");
      return;
    }

    // Basic PIN length validation
    if (transactionPin.length < 4) {
      alert("Please enter a valid transaction PIN.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Server call or API logic goes here
      const res = await serverCallFuction('POST', `api/transactions/withdraw`, {
        amount: inrAmount,
        remarks: "Withdraw request",
        pin: transactionPin
      })

      if (res.success) {
        alert(res.message)
        close();
      } else {
        setError(res.message || res.error)
      }

    } catch (err) {
      console.error("Withdrawal error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Conditions to determine if the form should be locked
  const isButtonDisabled =
    isSubmitting ||
    !uvAmount ||
    uvAmount <= 0 ||
    currentBalance <= 0 ||
    uvAmount > currentBalance ||
    !user?.kyc_status ||
    transactionPin.length === 0;

  return (
    <div className="mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">

      {/* KYC Warning Banner */}
      {!user?.kyc_status && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-amber-700 text-sm">
          <AlertCircle className="shrink-0" size={18} />
          <p>Your KYC is pending. Please complete your KYC verification to enable bank withdrawals.</p>
        </div>
      )}

      {/* Validation Error Banner */}
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

        {/* UV Amount Input Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount to Withdraw (UV)
          </label>
          <div className="relative">
            <input
              type="number"
              value={uvAmount || ""}
              onChange={(e) => setUvAmount(Math.max(0, Number(e.target.value)))}
              placeholder="Enter UV amount"
              className={`w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-brand-500'} rounded-xl outline-none transition-all`}
              required
              autoComplete="off"
            />
            <span className="absolute right-4 top-3.5 text-gray-400 font-medium">UV</span>
          </div>
        </div>

        {/* Real-time Financial Breakdown */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 uppercase">Gross Amount</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{inrAmount.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase">Amount to Bank</p>
            <p className="text-lg font-semibold text-brand-600">₹{inrAmount.toLocaleString()}</p>
          </div>
        </div>


        {/* Linked Bank Information Preview */}
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center gap-4">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Landmark size={20} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{(user as { bank_name?: string; bankName?: string })?.bank_name || (user as { bank_name?: string; bankName?: string })?.bankName || "No Bank Linked"}</p>
            <p className="text-xs text-gray-500">Acc: {(user as { account_no?: string; accountNo?: string })?.account_no || (user as { account_no?: string; accountNo?: string })?.accountNo || "0000"}</p>
            <p className="text-xs text-gray-500">Holder: {(user as { account_holder_name?: string; accountHolderName?: string })?.account_holder_name || (user as { account_holder_name?: string; accountHolderName?: string })?.accountHolderName || "N/A"}</p>
            <p className="text-xs text-gray-500">Routing/IFSC: {(user as { ifsc_code?: string; ifscCode?: string })?.ifsc_code || (user as { ifsc_code?: string; ifscCode?: string })?.ifscCode || "N/A"}</p>


          </div>
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold uppercase">Verified</span>
        </div>

        {/* Security Transaction PIN Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transaction PIN
          </label>
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

        {/* Dynamic Action Button */}
        <button
          type="submit"
          disabled={isButtonDisabled}
          className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 disabled:shadow-none text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all transform active:scale-[0.98]"
        >
          {isSubmitting ? "Processing..." : "Confirm Withdrawal"}
        </button>
      </form>
    </div>
  );
};

export default WithdrawalForm;