"use client";
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useAuth } from '@/context/AuthContext';
import serverCallFuction from '@/lib/constantFunction';
import React, { useState } from 'react';

const SetPin = () => {
    const { user, isLoading, updateUserProfile } = useAuth();

    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    if (isLoading) return null;

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
        setPin(value);
        if (error) setError('');
    };

    const handleSubmit = async () => {
        if (pin.length !== 4) {
            setError('PIN must be exactly 4 digits');
            return;
        }
        setSubmitLoading(true);
        setError('');
        try {
            const response = await serverCallFuction('POST', 'api/transactions/set-pin', { pin });
            // const response = await fetch('/api/transactions/set-pin', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`,
            //     },
            //     body: JSON.stringify({ pin }),
            // });
            // if (!response.ok) {
            //     const errorData = await response.json().catch(() => ({}));
            //     throw new Error(errorData.message || `Server error: ${response.status}`);
            // }
            if (response.status) {               

                updateUserProfile({ transaction_pin_hash: response.hash || 'set' });
                setShowPinModal(false);
                setPin('');
                setError('');
                // Optional: show success toast
                alert('Transaction PIN set successfully!');
            }
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to set PIN. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (user && !user.transaction_pin_hash) {
        return (
            <>
                <div className="mb-6 ">
                    <div className="flex items-center justify-between p-4 border border-warning-200 bg-warning-50 dark:bg-warning-200 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Badge color="warning" variant="solid">Action Required</Badge>
                            <p className="text-sm text-warning-800 font-medium">
                                Your transaction PIN is not set. Secure your account to start transacting.
                            </p>
                        </div>
                        <Badge
                            color="success"
                            variant="solid"
                            className="cursor-pointer hover:bg-success-100 p-2 rounded"
                            onClick={() => setShowPinModal(true)}
                        >
                            Set PIN Now
                        </Badge>
                    </div>
                </div>
                <Modal isOpen={showPinModal} onClose={() => {
                    setShowPinModal(false);
                    setPin('');
                    setError('');
                }} className="max-w-lg mx-auto">
                    <div className="p-4">
                        <h2 className="text-lg font-bold mb-6">Set Your Transaction PIN</h2>
                        <div className="space-y-4">
                            <p className="mb-4 text-gray-700">
                                Enter a 4-digit PIN for transaction security.
                            </p>
                            <div>
                                <label className="block text-sm font-medium mb-2">Transaction PIN *</label>
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={pin}
                                    onChange={handlePinChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-center font-mono text-lg tracking-widest h-12"
                                    placeholder="••••"
                                    required
                                />
                                {error && (
                                    <p className="mt-1 text-sm text-red-600">{error}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={handleSubmit}
                                disabled={submitLoading || pin.length !== 4}
                            >
                                {submitLoading ? 'Setting PIN...' : 'Set PIN'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowPinModal(false);
                                    setPin('');
                                    setError('');
                                }}
                                disabled={submitLoading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Modal>
            </>
        );
    }

    return null;
};

export default SetPin;

