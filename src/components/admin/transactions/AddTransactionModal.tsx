"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Modal as UiModal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Badge from '@/components/ui/badge/Badge';
import serverCallFuction from '@/lib/constantFunction';

import type { ChangeEvent } from 'react';

type TxType = 'credit' | 'debit';
type DeductionFrom = 'total_amount' | 'company_fund' | 'withdrawable_amount';

type AddTransactionPayload = {
    user_id: number;
    deduction_from: DeductionFrom;
    type: TxType;
    amount: string | number;
    category: string;
    remarks: string;
    status?: 'completed' | 'pending' | 'mature';
};

const DEFAULT_CATEGORIES = ['Commission', 'Withdraw', 'Bonus', 'Other'];

export default function AddTransactionModal({
    isOpen,
    onClose,
    onSuccess,
    prefillUserId,
    selectedUser
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    prefillUserId?: number | null;
    selectedUser?: { name: string; email: string } | null;
}) {
    const [userId, setUserId] = useState<string>('');
    const [type, setType] = useState<TxType>('credit');
    const [amount, setAmount] = useState<string>('');
    const [category, setCategory] = useState<string>('Commission');
    const [deductionFrom, setDeductionFrom] = useState<DeductionFrom>('total_amount');
    const [remarks, setRemarks] = useState<string>('');

    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!isOpen) return;
        setError('');
        setSubmitLoading(false);

        if (prefillUserId) {
            setUserId(String(prefillUserId));
        } else {
            setUserId('');
        }

        setType('credit');
        setDeductionFrom('total_amount');
        setAmount('');
        setCategory('Commission');
        setRemarks('');
    }, [isOpen, prefillUserId]);

    const categories = useMemo(() => DEFAULT_CATEGORIES, []);

    const validate = () => {
        const uid = Number(userId);
        if (!uid || Number.isNaN(uid)) return 'User ID is required.';
        if (!amount || Number(amount) <= 0) return 'Amount must be greater than 0.';
        if (!category.trim()) return 'Category is required.';
        return '';
    };

    const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value.replace(/[^0-9.]/g, '');
        setAmount(v);
    };

    const handleSubmit = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        const payload: AddTransactionPayload = {
            user_id: Number(userId),
            deduction_from: deductionFrom,
            type,
            amount: Number(amount), // Payload mapping converted to explicit numerical types
            category: category.trim().toLocaleLowerCase(),
            remarks: remarks.trim(),
            status: 'completed',
        };

        setSubmitLoading(true);
        setError('');
        try {
            const res = await serverCallFuction('POST', 'api/transactions/add-transaction', payload);
            console.log('Add Transaction Response:', res);
            const success = (res as { status?: boolean })?.status;

            if (success === false) {
                setError((res as { message?: string })?.message || 'Failed to add transaction');
                return;
            } else {

                onClose();
                onSuccess();
            }
        } catch (e: unknown) {
            setError((e as Error)?.message || 'Network error while adding transaction');
        } finally {
            // setSubmitLoading(false);
        }
    };

    return (
        <UiModal isOpen={isOpen} onClose={onClose} className="max-w-2xl mx-auto">
            <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">

                {/* Header Section */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Transaction</h2>
                        <p className="text-sm text-gray-500">Company fund uses.</p>
                    </div>
                </div>

                {error ? (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                    </div>
                ) : null}

                {/* Selected User Indicator */}
                <div className='mb-5'>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-pink-50 text-pink-700 border border-pink-100">
                        Transaction add for - {selectedUser?.name || 'N/A'}
                    </span>
                </div>

                {/* Form Input Field Layout Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* User ID Input Field Block */}
                    <div className="space-y-2 span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            User ID
                        </label>
                        <Input
                            placeholder="Enter user id"
                            value={userId}
                            disabled
                            onChange={(e) => setUserId(e.target.value)}
                            className="bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    {/* Deduct From Active Interactive Block */}
                    <div className="space-y-2 span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Deduct From
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setDeductionFrom('total_amount')}
                                className={`flex-1 h-11 px-4 text-sm font-medium rounded-xl border transition-all ${deductionFrom === 'total_amount'
                                    ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                    }`}
                            >
                                Total Amount
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeductionFrom('company_fund')}
                                className={`flex-1 h-11 px-4 text-sm font-medium rounded-xl border transition-all ${deductionFrom === 'company_fund'
                                    ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                    }`}
                            >
                                Company Fund
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeductionFrom('withdrawable_amount')}
                                className={`flex-1 h-11 px-4 text-sm font-medium rounded-xl border transition-all ${deductionFrom === 'withdrawable_amount'
                                    ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                    }`}
                            >
                                Withdraw Fund
                            </button>
                        </div>
                    </div>

                    {/* Transaction Type Selection Toggle Segment */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Type
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setType('credit')}
                                className={`flex-1 h-11 px-4 text-sm font-medium rounded-xl border transition-all ${type === 'credit'
                                    ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                    }`}
                            >
                                Credit
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('debit')}
                                className={`flex-1 h-11 px-4 text-sm font-medium rounded-xl border transition-all ${type === 'debit'
                                    ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                    }`}
                            >
                                Debit
                            </button>
                        </div>
                    </div>

                    {/* Amount Input Block */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Amount In Rupees
                        </label>
                        <Input
                            placeholder="0.00"
                            value={amount}
                            onChange={handleAmountChange}
                        />
                        <Badge className='hint-text'>Wallet credits and debits automatically convert to UV.</Badge>
                    </div>

                    {/* Category Selector Block */}
                    <div className="space-y-2 col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                            {categories.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Remarks Textarea Field Block */}
                <div className="mt-4 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Remarks
                    </label>
                    <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Enter remarks"
                        className="w-full min-h-[110px] resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                </div>

                {/* Form Action Submissions Area */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleSubmit}
                        disabled={submitLoading}
                        className="flex-1 h-12 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 text-white font-medium rounded-xl transition-all"
                    >
                        {submitLoading ? 'Adding...' : 'Add Transaction'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitLoading}
                        className="flex-1 h-12 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </UiModal>
    );
}