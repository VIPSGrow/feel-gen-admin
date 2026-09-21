"use client"
import React from 'react'
import Button from '@/components/ui/button/Button';
import { Check, Rocket, ShoppingCart, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const page = () => {
    const router = useRouter()
    return (
        <div className="min-h-screen flex items-center bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
            {/* Header Area */}


            <div className="max-w-6xl mx-auto mb-5">
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">

                    {/* Header Section */}
                    <div className="p-8 bg-brand-500/5 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                    <span className="text-4xl">🏗️</span> Account Activation & Benefits
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                                    Your account is currently <span className="text-amber-600 font-bold uppercase text-xs px-2 py-0.5 bg-amber-100 rounded-full">Inactive</span>.
                                    Complete the requirement below to activate your account and unlock professional business benefits.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">

                        {/* Activation Criteria Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-500 rounded-lg text-white">
                                    <Rocket size={20} />
                                </div>
                                <h4 className="text-xl font-bold text-gray-800 dark:text-white">Activation Criteria</h4>
                            </div>

                            <div className="space-y-2">
                                <div className="px-5 py-2 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Minimum Purchase</p>
                                    <p className="text-2xl font-black text-brand-600">Required package purchase</p>
                                    <p className="text-xs text-gray-500 mt-2">A qualifying package purchase is required to activate your account.</p>
                                </div>

                                <div className="flex gap-3 items-start">
                                    <div className="mt-1 bg-green-500 rounded-full p-1"><Check size={12} className="text-white" /></div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        <span className="font-bold text-gray-900 dark:text-white">Instant Activation:</span> Once verified, your status changes to "Active" immediately.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Unlock Benefits Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500 rounded-lg text-white">
                                    <Zap size={20} />
                                </div>
                                <h4 className="text-xl font-bold text-gray-800 dark:text-white">Unlock Exclusive Benefits</h4>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    "Direct Partner and Generation Commissions",
                                    "Sponsor-based referral earnings",
                                    "Exclusive Member-only Distributor Pricing",
                                    "Package benefits on every purchase",
                                    "Eligible for direct Wallet Withdrawals"
                                ].map((benefit, idx) => (
                                    <div key={idx} className="flex items-center gap-3 px-3 py-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="h-2 w-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(var(--brand-500),0.6)]" />
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{benefit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer CTA */}
                    {/* <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Join our elite distributor network today
                        </p>
                    </div> */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-5">
                        <Button
                            size="lg"
                            className="px-10 h-14 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-lg shadow-xl shadow-brand-500/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                            onClick={() => {
                                // Logic to scroll to products or navigate to shop
                                // document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
                                // window.location.href = '/shop'
                                router.push("/shop");
                            }}
                        >
                            <ShoppingCart size={22} strokeWidth={2.5} />
                            Start Purchasing Now
                        </Button>

                        <Link href={"https://feelsafeco.in/contact-us"} target='_blank'>
                            <Button
                                variant="outline"
                                size={"lg"}
                                className="px-10 h-14 rounded-2xl border-2 border-gray-200 dark:border-gray-700 font-bold hover:bg-gray-100 dark:hover:bg-gray-800"
                            // onClick={() => window.location.href = '/support'}
                            >
                                Talk to Consultant
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default page
