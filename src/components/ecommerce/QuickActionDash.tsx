"use client"
import React from 'react'
import Button from '../ui/button/Button'
import { useRouter } from 'next/navigation' // Use navigation for App Router

const QuickActionDash = () => {
    const router = useRouter();

    const redirection = (url: string) => {
        // We return a function so it doesn't execute immediately on render
        return () => {
            router.push(url);
        };
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:gap-6 gap-6">
            {/* Quick Actions Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Quick Actions</h3>
                <div className="grid grid-cols-3 gap-3">
                    <Button
                        variant="outline"
                        onClick={redirection("/members/add")}
                        className="w-full h-14 border-brand-500 text-brand-500 hover:bg-brand-700 hover:text-white transition-colors"
                    >
                        Add Member
                    </Button>
                    <Button
                        onClick={redirection("/products/add")}
                        className="w-full h-14 bg-gradient-to-r from-brand-300 to-sky-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg transition-all duration-300"
                    >
                        Add Product
                    </Button>
                    <Button onClick={redirection("/notifications")} className="w-full h-14 hover:bg-brand-700 hover:text-white" variant="outline">Send Notification</Button>
                    <Button onClick={redirection("/withdrawal-requests")} className="w-full h-14 hover:bg-brand-700 hover:text-white" variant="outline">View Payouts</Button>
                    <Button onClick={redirection("/transactions")} className="w-full h-14 hover:bg-brand-700 hover:text-white" variant="outline">View Transaction</Button>
                    <Button onClick={redirection("/orders")} className="w-full h-14 hover:bg-brand-700 hover:text-white" variant="outline">View Orders</Button>
                </div>
            </div>

            {/* Upcoming Events Card */}
            {/* <div className="rounded-2xl border border-gray-200 p-6 dark:border-gray-800 bg-[linear-gradient(135deg,var(--color-brand-50)_0%,#ffffff_100%)] dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Upcoming Events</h3>

                <div className="pt-2 overflow-y-auto max-h-[300px] custom-scrollbar">
                    <ul className="space-y-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                            <li key={item} className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-100 shadow-sm">
                                <span className="font-medium text-brand-600 mr-2">•</span>
                                New update available for system #{item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div> */}
        </div>
    )
}

export default QuickActionDash