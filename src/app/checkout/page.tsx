"use client";
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';

import CheckoutForm from '../../components/checkout-compo/CheckoutForm';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useSetting } from '@/context/SettingContext';
import AppHeaderLogout from '@/layout/AppHeaderLogout';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutPage = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { items, totalItems, totalAmount, loading, clearCart } = useCart();
  const { settings, getSettingByKey } = useSetting();

  // 1. Get the shipping charge and safely force convert it to a real number
  const shippingCharges = useMemo(() => {
    const settingObj = getSettingByKey("shipping_charge");
    const charge = settingObj?.charge;
    const parsedCharge = Number(charge);
    return isNaN(parsedCharge) ? 0 : parsedCharge;

  }, [getSettingByKey, settings]);

  // 2. Compute the combined final total amount (Cart Items Total + Shipping Charge)
  const finalTotalAmount = useMemo(() => {
    // return totalAmount + shippingCharges;
    return totalAmount;
  }, [totalAmount, shippingCharges]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500 mr-2"></div>
        <div>Loading cart...</div>
      </div>
    );
  }

  if (totalItems === 0 || !user) {
    return (
      <div className="container mx-auto p-6 max-w-2xl text-center py-20">
        <AppHeaderLogout />
        <h2 className="text-2xl font-bold mb-4">No items in cart</h2>
        <p className="text-muted-foreground mb-8">Your cart is empty. Add some products first.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <AppHeaderLogout />
      <div className="bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 rounded-xl">
                <ShoppingCart className="w-8 h-8 text-brand-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Checkout</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Review your order - {totalItems === 0 ? 'No items' : `${totalItems} item${totalItems > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </div>

          {/* Changed condition check: 
            We check if settings are loaded (`settings`) instead of checking `shippingCharges`.
            This ensures that if shipping is 0 (Free Shipping), the CheckoutForm still displays correctly!
          */}
          {settings && (
            <CheckoutForm
              cartItems={items}
              totalAmount={finalTotalAmount} // Pass down the combined sum total here
              shippingCharges={shippingCharges} // Optional: Pass shipping separately if CheckoutForm needs to break down fees
              user={user}
              onSuccess={() => {
                clearCart();
                if (user?.is_active) {
                  router.replace('/placed_order');
                } else {
                  logout();
                }
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;