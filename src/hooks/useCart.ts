"use client";
import { useState, useEffect, useCallback } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import { BackendCartItem, NewCartResponse, NewCartItem, AddToCartPayload } from '@/types/cart';
import { formattedAmount } from '@/lib/constantFunction';

export const useCart = () => {
  const [items, setItems] = useState<BackendCartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await serverCallFuction('GET', 'api/ecom/d_cart') as NewCartResponse;
      if (res.status) {
        const cartItems: BackendCartItem[] = res.cart.items.map((item: NewCartItem) => ({
          id: item.id,
          product_id: item.product_id,
          product: {
            name: item.product_name,
            f_image: item.f_image,
            tax_data: item.tax_data || null,
            hsn_code:item.hsn_code || null,
            total_unit_price:item.total_unit_price || null
            // Add other product fields if needed
          },
          variant_id: item.variation_id || undefined,
          quantity: item.quantity,
          price: parseFloat(item.price),
          subtotal: item.quantity * parseFloat(item.price),
          product_name: item.product_name,
          f_image: item.f_image,
          is_variation_null: item.is_variation_null,
          variant_details:item.variant_details
        }));
        setItems(cartItems);
        setTotalItems(res.cart.total_items || 0);
        setTotalAmount(res.cart.total);
      }
    } catch (error) {
      console.error('Fetch cart error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (payload: AddToCartPayload) => {
    setLoading(true);
    try {
      const res = await serverCallFuction('POST', 'api/ecom/cart/d_items', payload);
      if (res.status) {
        fetchCart(); // Refresh
        return true;
      }
    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const updateQuantity = async (itemId: string | number, qty: number) => {
    setLoading(true);
    try {
      const res = await serverCallFuction('PUT', `api/ecom/cart/d_items/${itemId}/updateQuantity`, { quantity: qty });
      if (res.status) {
        fetchCart();
        return true;
      }
    } catch (error) {
      console.error('Update qty error:', error);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const removeItem = async (itemId: string | number) => {
    setLoading(true);
    try {
      // TODO: Confirm DELETE endpoint
      const res = await serverCallFuction('DELETE', `api/ecom/cart/d_items/${itemId}`);
      if (res.status) {
        fetchCart();
        return true;
      }
    } catch (error) {
      console.error('Remove item error:', error);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      // TODO: Confirm clear endpoint
      const res = await serverCallFuction('DELETE', 'api/ecom/cart/d_clear');
      if (res.status) {
        fetchCart();
        return true;
      }
    } catch (error) {
      console.error('Clear cart error:', error);
    } finally {
      setLoading(false);
    }
    return false;
  };

  return {
    items,
    totalItems,
    totalAmount,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };
};


