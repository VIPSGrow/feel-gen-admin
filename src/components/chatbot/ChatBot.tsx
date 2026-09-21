"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

import { useRouter } from 'next/navigation';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
    role: ChatRole;
    text: string;
    timestamp: number;
};

type ChatbotApiResponse = {
    reply?: string;
    intent?: any;
    data?: any;
    message?: string;
    status?: boolean;
};

function isDistributorRole(role: string | null | undefined) {
    if (!role) return false;
    return role.toLowerCase() === 'distributor' || role.toLowerCase() === 'super admin' || role.toLowerCase() === 'admin';
}

const ChatBot = () => {
    const { user, role, isLoading } = useAuth();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [kycBlocked, setKycBlocked] = useState(false);
    const [errorInline, setErrorInline] = useState<string | null>(null);

    const listEndRef = useRef<HTMLDivElement | null>(null);

    const canShow = useMemo(() => {
        if (isLoading) return false;
        if (!user) return false;
        return isDistributorRole(role);
    }, [isLoading, role, user]);

    useEffect(() => {
        if (!open) return;
        setErrorInline(null);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const t = window.setTimeout(() => {
            listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
        return () => window.clearTimeout(t);
    }, [messages, open]);

    useEffect(() => {
        if (!canShow) return;
        // Seed assistant welcome once
        if (messages.length === 0) {
            setMessages([
                {
                    role: 'assistant',
                    text: 'Hi! I can help with your account. Ask me about your wallet, downline count, or latest commissions.',
                    timestamp: Date.now(),
                },
            ]);
        }
    }, [canShow, messages.length]);

    if (!canShow) return null;

    const sendMessage = async () => {
        const message = input.trim();
        if (!message) return;
        if (kycBlocked) return;
        if (isSending) return;

        setErrorInline(null);
        setIsSending(true);

        const userMsg: ChatMessage = {
            role: 'user',
            text: message,
            timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');

        try {
            // serverCallFuction uses /api/support base; endpoint should be relative to that base
            // and uses x-auth-token automatically.
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://backend.feelsafeco.in'}/api/chatbot/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('authToken') || '',
                },
                body: JSON.stringify({ message }),
            });

            if (res.status === 202) {
                const data = (await res.json().catch(() => ({}))) as any;
                const text = data?.message || 'KYC not completed';
                setKycBlocked(true);
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', text, timestamp: Date.now() },
                ]);
                return;
            }

            if (!res.ok) {
                const data = (await res.json().catch(() => ({}))) as any;
                throw new Error(data?.message || `Chatbot request failed: ${res.status}`);
            }

            const payload = (await res.json()) as ChatbotApiResponse;
            const reply = payload?.reply || 'Done.';
            setMessages((prev) => [...prev, { role: 'assistant', text: reply, timestamp: Date.now() }]);
        } catch (e: any) {
            const msg = e?.message || 'Chatbot error';
            setErrorInline(msg);
            setMessages((prev) => [...prev, { role: 'assistant', text: msg, timestamp: Date.now() }]);
        } finally {
            setIsSending(false);
        }
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            void sendMessage();
        }
    };

    return (
        <div className="fixed z-[60] bottom-6 right-6">
            {/* Chat panel */}
            {open && (
                <div className="w-[340px] sm:w-[380px] h-[460px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl flex flex-col overflow-hidden">
                    <div className="px-4 py-3 bg-brand-600 text-white flex items-center justify-between gap-3">
                        <div className="font-semibold text-sm">FeelSafe Assistant</div>
                        <button
                            type="button"
                            className="text-white/90 hover:text-white"
                            onClick={() => setOpen(false)}
                            aria-label="Close chat"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white to-gray-50 dark:from-gray-900 dark:to-gray-900">
                        {messages.map((m, idx) => (
                            <div
                                key={`${m.timestamp}-${idx}`}
                                className={
                                    m.role === 'user'
                                        ? 'flex justify-end'
                                        : 'flex justify-start'
                                }
                            >
                                <div
                                    className={
                                        m.role === 'user'
                                            ? 'max-w-[85%] rounded-2xl bg-brand-600 text-white px-3 py-2 text-sm'
                                            : 'max-w-[85%] rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm'
                                    }
                                >
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        <div ref={listEndRef} />
                    </div>

                    {errorInline && (
                        <div className="px-4 pb-2">
                            <div className="text-xs text-red-600">{errorInline}</div>
                        </div>
                    )}

                    {kycBlocked && (
                        <div className="px-4 pb-2">
                            <div className="text-xs text-amber-700 dark:text-amber-300">
                                KYC not completed. Please complete KYC to continue chatting.
                            </div>
                            <button
                                type="button"
                                className="mt-2 w-full text-xs font-semibold px-3 py-2 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-400/40 hover:bg-amber-500/25"
                                onClick={() => router.push('/kyc')}
                            >
                                Go to KYC
                            </button>
                        </div>
                    )}

                    <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                disabled={kycBlocked || isSending}
                                placeholder={kycBlocked ? 'KYC required' : 'Type your message...'}
                                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
                            />
                            <button
                                type="button"
                                disabled={kycBlocked || isSending}
                                onClick={() => void sendMessage()}
                                className="rounded-xl bg-brand-600 text-white px-3 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? '...' : 'Send'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating button */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-14 h-14 rounded-full bg-brand-600 text-white shadow-lg flex items-center justify-center hover:bg-brand-700 active:scale-[0.98] transition"
                aria-label="Open chatbot"
            >
                💬
            </button>
        </div>
    );
};

export default ChatBot;

