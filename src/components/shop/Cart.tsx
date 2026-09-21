"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@/hooks/useCart';
import { AddToCartPayload, BackendCartItem } from '@/types/cart';
import { formattedAmount, formattedAmountCommas, getCurrencyIcon } from '@/lib/constantFunction';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, X } from 'lucide-react';
import Button from '@/components/ui/button/Button';

import Link from 'next/link';
import Image from 'next/image';
import Badge from '../ui/badge/Badge';

// A lightweight sub-component for the quantity input to manage its own debounced state easily
type QuantiyInputProps = {
  item: any;
  updateQuantity: (itemId: string | number, qty: number) => Promise<any>;
  setLocalLoading: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
};

const QuantiyInput: React.FC<QuantiyInputProps> = ({ item, updateQuantity, setLocalLoading }) => {
  const [inputValue, setInputValue] = useState(item.quantity || 1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep input in sync if quantity changes via Plus/Minus buttons
  // (No useEffect needed; input is initialized from item.quantity and updated via onChange/onBlur.)

  const triggerUpdate = async (val: number) => {
    if (isNaN(val) || val < 1) return;
    if (val === item.quantity) return; // Skip if value hasn't actually changed

    setLocalLoading(prev => ({ ...prev, [String(item.id)]: true }));
    await updateQuantity(item.id, val);
    setLocalLoading(prev => ({ ...prev, [String(item.id)]: false }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueStr = e.target.value;
    const parsedInt = parseInt(valueStr, 10);

    setInputValue(valueStr === "" ? "" : parsedInt);

    if (!isNaN(parsedInt) && parsedInt >= 1) {
      // Clear the previous timer if user keeps typing
      if (timerRef.current) clearTimeout(timerRef.current);

      // Wait 600ms after the last keystroke before hitting the API
      timerRef.current = setTimeout(() => {
        triggerUpdate(parsedInt);
      }, 600);
    }
  };

  const handleBlur = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // Fallback if field is left empty or invalid
    if (inputValue === "" || isNaN(Number(inputValue)) || Number(inputValue) < 1) {
      setInputValue(item.quantity);
    } else {
      triggerUpdate(Number(inputValue));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Triggers handleBlur immediately
    }
  };

  return (
    <input
      type="number"
      min="1"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="flex-1 w-full bg-transparent text-center text-sm font-bold text-gray-800 dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
};

const Cart = () => {
  const { items, totalItems, totalAmount, loading, updateQuantity, removeItem, clearCart, addToCart } = useCart();
  const MIN_LIMIT_ORDER_TOTAL = 700; // 1 Lakh (INR)
  const isBelowMinLimit = Number(totalAmount) < MIN_LIMIT_ORDER_TOTAL;
  const [localLoading, setLocalLoading] = useState<{ [key: string]: boolean }>({});

  const currency = getCurrencyIcon('INR');

  if (loading && totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="text-lg text-gray-500 dark:text-gray-400">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 rounded-xl">
              <ShoppingCart className="w-8 h-8 text-brand-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Shopping Cart</h1>
              <p className="text-gray-500 dark:text-gray-400">
                {totalItems === 0 ? 'No items' : `${totalItems} item${totalItems > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 rounded-xl cursor-pointer" onClick={() => {
            const confirmed = confirm("Are you sure you want to clear the cart?");
            if (confirmed) {
              clearCart();
            }
          }}>
            <X className="w-8 h-8 text-brand-500" />
          </div>
        </div>

        {totalItems === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Add some products to get started.</p>
            <Link href="/shop" className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-600 transition">
              Continue Shopping
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Product</th>
                      <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Price</th>
                      <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity</th>
                      <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                              <Image
                                src={item.product?.f_image || item.f_image || '/images/product/placeholder.jpg'}
                                alt={item.product?.name || item.product_name || ''}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-white line-clamp-1 max-w-xs">
                                {item.product?.name || item.product_name || ''}
                              </h4>
                              <span className="text-[12px] text-gray-900 dark:text-white">MRP : {currency}{item.product?.total_unit_price ?? 'N/A'}</span>
                              {item.is_variation_null === false ? (
                                <div className='flex gap-2 mt-1'>
                                  {item.variant_details?.attributes?.map((attr: any, idx: number) => (
                                    <Badge key={idx}>{attr.attribute_name} - {attr.value}</Badge>
                                  ))}
                                </div>
                              ) : ""}
                              {item.variant && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  SKU: {item.variant.sku}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-lg font-bold text-gray-800 dark:text-white">
                            {currency}{formattedAmount(item.price)}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (confirm('Remove this item?')) {
                                  await removeItem(item.id);
                                }
                              }}
                            >
                              <Trash2 size={16} color='red' />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (item.quantity <= 1) {
                                  if (confirm('Remove this item?')) {
                                    await removeItem(item.id);
                                  }
                                } else {
                                  setLocalLoading(prev => ({ ...prev, [String(item.id)]: true }));
                                  await updateQuantity(item.id, Math.max(1, item.quantity - 1));
                                  setLocalLoading(prev => ({ ...prev, [String(item.id)]: false }));
                                }
                              }}
                              disabled={localLoading[String(item.id)] || item.quantity <= 1}
                            >
                              {item.quantity <= 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                            </Button>
                            <span className="w-12 text-center font-semibold text-lg text-gray-800 dark:text-white flex items-center justify-center">
                              {/* Swapped input with isolated self-debouncing element */}
                              <QuantiyInput
                                item={item}
                                updateQuantity={updateQuantity}
                                setLocalLoading={setLocalLoading}
                              />
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                setLocalLoading(prev => ({ ...prev, [String(item.id)]: true }));
                                await updateQuantity(item.id, item.quantity + 1);
                                setLocalLoading(prev => ({ ...prev, [String(item.id)]: false }));
                              }}
                              disabled={localLoading[String(item.id)]}
                            >
                              <Plus size={16} />
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-lg font-bold text-gray-800 dark:text-white">
                            {currency}{formattedAmount(item.subtotal || (item.quantity * item.price))}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="lg:order-2">
                <Link
                  href="/checkout"
                  aria-disabled={isBelowMinLimit}
                  onClick={(e) => {
                    if (isBelowMinLimit) {
                      e.preventDefault();
                      alert('Minimum order total is 1 Lakh INR.');
                    }
                  }}
                  className={`w-full block bg-brand-500 text-white font-bold py-4 px-8 rounded-2xl text-lg text-center shadow-xl transition-all flex items-center justify-center gap-3 ${isBelowMinLimit ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-brand-600 hover:shadow-2xl'}`}
                >
                  Proceed to Checkout <ArrowRight size={20} />
                </Link>
              </div>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl lg:order-1">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                    <span className="font-semibold">{currency}{formattedAmountCommas(totalAmount)}</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center text-2xl font-black text-gray-800 dark:text-white">
                    <span>Total:</span>
                    <span>{currency}{formattedAmountCommas(totalAmount)}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={clearCart}
                  disabled={loading}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div >
  );
};

export default Cart;