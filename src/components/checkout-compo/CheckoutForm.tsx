"use client";

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/Card';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Image from 'next/image';
import { BackendCartItem } from '@/types/cart';
import { RazorpayPaymentResponse } from '@/types/purchase';
import serverCallFuction, { formattedAmountCommas } from '@/lib/constantFunction';
import { formattedAmount, getCurrencyIcon } from '@/lib/constantFunction';
import { useAuth } from '@/context/AuthContext';
import Badge from '../ui/badge/Badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Modal } from '@/components/ui/modal';
import { Plus } from 'lucide-react';

import { Address, CreateAddressPayload } from '@/types/address';
import { States } from '@/types/static-content';
import { usePreloader } from '@/context/PreloaderContext';
import { useWallet } from '@/context/WalletContext';

type PaymentMethod = 'online' | 'wallet';


declare global {
  interface Window {
    Razorpay: new (options: unknown) => { open: () => void };
  }
}

interface CartCheckoutProps {
  cartItems: BackendCartItem[];
  totalAmount: number;
  user: Record<string, unknown>;
  shippingCharges: number;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<CartCheckoutProps> = ({ cartItems, totalAmount, user, onSuccess, shippingCharges }) => {
  const MIN_LIMIT_ORDER_TOTAL = 700; // 1 Lakh (INR)
  const isBelowMinLimit = Number(totalAmount) < MIN_LIMIT_ORDER_TOTAL;

  const [formData, setFormData] = useState({
    full_name: (user as any).full_name || (user as any).username || '',
    email: (user as any).email || '',
    phone: (user as any).phone || (user as any).whatsappNo || '',
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedShippingId, setSelectedShippingId] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Add Address Modal State
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [addAddressForm, setAddAddressForm] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    landmark: '',
    is_default: false,
  } as CreateAddressPayload);

  // State/City dropdown data
  const [states, setStates] = useState<{ id: number; name: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const fetchStates = async () => {
    try {
      setLoadingStates(true);
      const res = await serverCallFuction('GET', 'api/static/states');
      if (res.status && Array.isArray(res.data)) {
        setStates(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch states:', error);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async (stateId?: number) => {
    if (!stateId) {
      setCities([]);
      return;
    }
    try {
      setLoadingCities(true);
      const res = await serverCallFuction('GET', `api/static/cities/${stateId}`);
      if (res.status && Array.isArray(res.data)) {
        setCities(res.data);
        setAddAddressForm((prev) => ({ ...prev, city: '' }));
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const resetAddAddressForm = () => {
    setAddAddressForm({
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      landmark: '',
      is_default: false,
    } as CreateAddressPayload);
  };

  const handleAddAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name === 'state') {
      const data = JSON.parse(value);
      setAddAddressForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : data.name,
        stateId: data.id,
      }));
    } else {
      let finalValue: any = type === 'checkbox' ? checked : value;
      if (name === 'phone' && typeof finalValue === 'string') {
        finalValue = finalValue.replace(/\D/g, '');
      }

      setAddAddressForm((prev) => ({
        ...prev,
        [name]: finalValue,
      }));
    }
  };

  const handleAddNewAddress = async () => {
    if (
      !addAddressForm.full_name ||
      !addAddressForm.phone ||
      addAddressForm.phone.length !== 10 ||
      !addAddressForm.address_line1 ||
      !addAddressForm.city ||
      !addAddressForm.state ||
      !addAddressForm.pincode
    ) {
      alert('Please fill all required fields: name, phone (10 digits), address, city, state, pincode');
      return;
    }

    if (!/^\d{10}$/.test(addAddressForm.phone as any)) {
      alert('Phone must be 10 digits');
      return;
    }

    try {
      const res = await serverCallFuction('POST', 'api/ecom/d_addresses?type=distributor', addAddressForm);
      if (res.status) {
        setIsAddAddressModalOpen(false);
        resetAddAddressForm();
        await fetchAddresses();
        alert('Address added successfully!');
      } else {
        alert('Failed to add address: ' + (res.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to add address: ' + (error as Error).message);
    }
  };

  const router = useRouter();
  const { updateUserProfile } = useAuth();
  const { showLoader, hideLoader } = usePreloader();

  const { walletData, isLoading: walletLoading } = useWallet();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');

  // NOTE: Do not use an extra effect to set default payment method.
  // RadioGroup should render correctly from initial state.


  useEffect(() => {
    // Ensure default selection is visually applied on initial render.
    // Some RadioGroup implementations require explicit state-setting after mount.
    setPaymentMethod('online');
  }, []);



  const walletTotalAmount = (() => {
    if (!walletData) return 0;

    // Agar Array hai to pehla element le, agar direct Object hai to wahi le
    const wallet = Array.isArray(walletData) ? walletData[0] : walletData;
    const raw = wallet?.total_balance;

    const n = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(n) ? n : 0;
  })();



  const currency = getCurrencyIcon('INR');

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await serverCallFuction('GET', 'api/ecom/d_addresses?type=distributor');
      if (res.status) {
        const addrList = Array.isArray(res.data) ? res.data : res.address ? [res.address] : [];
        setAddresses(addrList);
        if (addrList.length > 0) {
          const defaultAddr = addrList.find((a: Address) => a.is_default) || addrList[0];
          setSelectedShippingId(defaultAddr.id);
          setSelectedAddress(defaultAddr);
        }
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    fetchStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (addAddressForm.state) {
      const stateId = parseInt(String(addAddressForm.stateId));
      if (Number.isFinite(stateId)) fetchCities(stateId);
    }
  }, [addAddressForm.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createRazorpayOrder = async (amt: number, cartItemsArg: BackendCartItem[]) => {
    try {
      if (!selectedAddress) {
        alert('Please select Shipping Address');
        return;
      }

      showLoader('Creating order...');
      const res = await serverCallFuction('POST', 'api/payment/create-order', {
        amount: Math.round(amt),
        currency: 'INR',
        cart_items: cartItemsArg.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
        receipt: `receipt_${Date.now()}`,
      });

      if (!res.status) throw new Error(res.message || 'Order creation failed');
      return res.order;
    } catch (error) {
      throw new Error('Failed to create order');
    }
  };

  const verifyPayment = async (paymentData: RazorpayPaymentResponse) => {
    try {
      showLoader('Verifying payment...');
      const res = await serverCallFuction('POST', 'api/payment/verify', paymentData);
      if (!res.success) throw new Error(res.message || 'Payment verification failed');
      return res.data;
    } catch (error) {
      throw new Error('Payment verification failed');
    }
  };

  const placePurchaseOrder = async (
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string,
    paymentMethod = 'razorpay',
  ) => {
    try {
      showLoader('Almost done! Loading...');

      const items = cartItems.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        qty: item.quantity,
        tax_data: item.product?.tax_data || null,
        hsn_code: item.product?.hsn_code || null,
        dimension_unit: item.product?.dimension_unit || null,
        dimension_width: item.product?.dimension_width || null,
        dimension_height: item.product?.dimension_height || null,
        dimension_length: item.product?.dimension_length || null,
      }));

      const res = await serverCallFuction('POST', 'api/orders/d_p_o', {
        items,
        shipping_address: selectedAddress,
        payment_method: paymentMethod,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_order_id: razorpayOrderId,
        razorpay_signature: razorpaySignature,
      });

      if (res.success) {
        await serverCallFuction('DELETE', 'api/ecom/cart/d_clear');
        alert('Order placed successfully!');
        onSuccess();
        hideLoader();
      } else {
        throw new Error(res.message || 'Order placement failed');
      }
    } catch (error) {
      console.error('Place order error:', error);
      throw new Error(`Order placement failed: ${(error as Error).message}`);
    }
  };

  const handlePayment = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Wallet flow
    if (paymentMethod === 'wallet') {
      if (walletLoading) {
        alert('Wallet is loading. Please wait');
        return;
      }

      if (walletTotalAmount < totalAmount) {
        alert(`Insufficient wallet balance. Available: ${currency}${walletTotalAmount}`);
        return;
      }

      if (isBelowMinLimit) {
        alert('Minimum order total is 1 Lakh INR.');
        return;
      }

      if (!formData.full_name || !formData.phone || formData.phone.length !== 10) {
        alert('Please fill valid name and 10-digit phone');
        return;
      }

      if (!selectedAddress) {
        alert('Please select a shipping address or add one in profile');
        return;
      }

      setLoading(true);
      try {
        await placePurchaseOrder('', '', '', 'wallet');
      } catch (err) {
        alert(`Payment failed: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
      return;
    }


    if (isBelowMinLimit) {
      alert('Minimum order total is 1 Lakh INR.');
      return;
    }

    if (!formData.full_name || !formData.phone || formData.phone.length !== 10) {
      alert('Please fill valid name and 10-digit phone');
      return;
    }

    if (!selectedAddress) {
      alert('Please select a shipping address or add one in profile');
      return;
    }

    if (!window.Razorpay || !razorpayLoaded) {
      alert('Razorpay loading... Please wait');
      return;
    }

    setLoading(true);
    try {
      const order = await createRazorpayOrder(totalAmount, cartItems);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_Sfdk41BOifNjN9',
        amount: order.amount,
        currency: order.currency,
        name: 'Feel Safe Shop',
        description: `Order Total ₹${totalAmount.toLocaleString()}`,
        order_id: order.id,
        prefill: {
          name: formData.full_name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#3399cc' },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await placePurchaseOrder(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
              'razorpay',
            );
          } catch (err) {
            alert(`Payment failed: ${(err as Error).message}`);
            router.push('/cart');
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      hideLoader();
      alert(`Error: ${(error as Error).message}`);
    } finally {
      hideLoader();
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onReady={() => setRazorpayLoaded(true)} />

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 max-w-[1400px] mx-auto px-4">
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-2">
                <div>
                  <Label>Full Name</Label>
                  <Input name="full_name" defaultValue={formData.full_name} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input name="email" type="email" defaultValue={formData.email} onChange={handleInputChange} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    name="phone"
                    type="tel"
                    defaultValue={formData.phone}
                    onChange={handleInputChange}
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between w-full bg-gray-200 p-2 rounded-lg mb-2">
                  <Label className="block font-semibold">
                    Shipping Address <span className="text-red-500">*</span>
                  </Label>
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-300 rounded-full transition-colors"
                    onClick={() => setIsAddAddressModalOpen(true)}
                  >
                    <Plus size={20} />
                  </button>
                </div>


                {loadingAddresses ? (
                  <p>Loading addresses...</p>
                ) : addresses.length === 0 ? (
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500 dark:border-gray-600">
                    No addresses found.{' '}
                    <span className="text-brand-500 hover:underline font-medium" onClick={() => setIsAddAddressModalOpen(true)}>
                      Add address
                    </span>
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedShippingId}
                    onValueChange={(value) => {
                      setSelectedShippingId(value);
                      const addr = addresses.find((a: Address) => a.id === value);
                      setSelectedAddress(addr || null);
                    }}
                    className="space-y-2"
                  >
                    {addresses.map((address) => {
                      const isSelected = selectedShippingId === address.id;
                      return (
                        <div
                          key={address.id}
                          onClick={() => {
                            setSelectedShippingId(address.id);
                            setSelectedAddress(address);
                          }}
                          className={`flex items-start p-4 border-2 rounded-xl transition-all cursor-pointer mb-3 ${isSelected
                            ? 'border-brand-500 bg-brand-50 shadow-md ring-1 ring-brand-500'
                            : 'border-gray-100 hover:border-gray-300 bg-white'
                            }`}
                        >
                          <div className="mt-1 mr-3">
                            <RadioGroupItem value={address.id} id={`addr-${address.id}`} className="h-5 w-5" name="address" />
                          </div>

                          <Label htmlFor={`addr-${address.id}`} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900">{address.full_name}</span>
                              {address.is_default && (
                                <Badge variant="solid" color="success" className="text-[10px] px-2 py-0">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {address.address_line1}
                              {address.address_line2 && ', ' + address.address_line2}
                            </p>
                            <p className="text-sm font-medium text-gray-500">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <p className="text-xs text-brand-600 mt-2 font-semibold">📞 {address.phone}</p>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                )}

                {/* <div className="flex items-center justify-between w-full bg-gray-200 p-2 rounded-lg mb-2">
                  <Label className="block font-semibold">
                    Shipping Charges <span className="text-red-500">*</span>
                  </Label>
                  <button type="button" className="p-1 hover:bg-gray-300 rounded-full transition-colors">
                    {currency}{shippingCharges}
                  </button>
                </div> */}
              </div>

              {/* Payment Method */}
              <div className="mt-4">
                <Label className="block font-semibold mb-2">Payment Method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="space-y-2"
                >
                  <div
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${paymentMethod === 'online' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'
                      }`}
                    onClick={() => setPaymentMethod('online')}
                  >
                    <RadioGroupItem value="online" id="pay-online" className="h-5 w-5" name="paymentMethod" checked={paymentMethod === "online"} />
                    <Label htmlFor="pay-online" className="cursor-pointer">
                      Online (Razorpay)
                    </Label>
                  </div>

                  <div
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${paymentMethod === 'wallet' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'
                      }`}
                    onClick={() => setPaymentMethod('wallet')}
                  >
                    <RadioGroupItem value="wallet" id="pay-wallet" className="h-5 w-5" name="paymentMethod" checked={paymentMethod === "wallet"} />
                    <Label htmlFor="pay-wallet" className="cursor-pointer">
                      Wallet ({currency}{walletTotalAmount})
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                className="w-full mt-3"
                disabled={
                  loading ||
                  loadingAddresses ||
                  !selectedShippingId ||
                  isBelowMinLimit ||
                  (paymentMethod === 'wallet' && (walletLoading || walletTotalAmount < totalAmount)) ||
                  (paymentMethod === 'online' && (!window.Razorpay || !razorpayLoaded))
                }
                onClick={() => handlePayment()}
              >
                {loading
                  ? 'Processing...'
                  : paymentMethod === 'wallet'
                    ? `Pay ${currency}${formattedAmountCommas(totalAmount)} with Wallet`
                    : `Pay ${currency}${formattedAmountCommas(totalAmount)} with Razorpay`}
              </Button>


              <Modal
                isOpen={isAddAddressModalOpen}
                onClose={() => {
                  setIsAddAddressModalOpen(false);
                  resetAddAddressForm();
                }}
                className="max-w-lg"
              >
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-center">Add New Address</h2>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Full Name <span className="text-red-500">*</span></Label>
                      <Input
                        value={addAddressForm.full_name}
                        placeholder="Full Name"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^[a-zA-Z\s]+$/.test(value)) {
                            setAddAddressForm({ ...addAddressForm, full_name: value });
                          }
                        }}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={addAddressForm.phone}
                        type="tel"
                        placeholder="Enter phone number"
                        onChange={(e) => {
                          const value = e.target.value;
                          const val = value.replace(/\D/g, '');
                          setAddAddressForm({ ...addAddressForm, phone: val });
                        }}
                        maxLength={10}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="address_line1">Address Line 1 <span className="text-red-500">*</span></Label>
                      <Input
                        id="address_line1"
                        name="address_line1"
                        defaultValue={addAddressForm.address_line1}
                        onChange={handleAddAddressChange}
                        required
                        placeholder="eg.: FLoor No., Landmark etc"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address_line2">Address Line 2</Label>
                      <Input
                        id="address_line2"
                        name="address_line2"
                        defaultValue={addAddressForm.address_line2}
                        onChange={handleAddAddressChange}
                        placeholder="eg.: Street etc"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                        <select
                          id="state"
                          name="state"
                          value={addAddressForm.state}
                          onChange={(e) => {
                            const selectedIndex = e.target.selectedIndex;
                            const selectedOption = e.target.options[selectedIndex];
                            const stateId = Number(selectedOption.getAttribute('data-id'));
                            const stateName = e.target.value;
                            setAddAddressForm((prev) => ({ ...prev, state: stateName, stateId }));
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700"
                          disabled={loadingStates}
                          required
                        >
                          <option value="">Select State</option>
                          {loadingStates ? (
                            <option disabled>Loading...</option>
                          ) : (
                            states.map((state: States) => (
                              <option key={state.id} value={state.name.toString()} data-id={state.id.toString()}>
                                {state.name}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                        <select
                          id="city"
                          name="city"
                          value={addAddressForm.city}
                          onChange={(e) => setAddAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700"
                          disabled={loadingCities || !addAddressForm.state}
                          required
                        >
                          <option value="">Select City</option>
                          {loadingCities ? (
                            <option disabled>Loading...</option>
                          ) : (
                            cities.map((city: States) => (
                              <option key={city.id} value={city.name.toString()}>
                                {city.name}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={addAddressForm.country}
                          // onChange={(e) => setAddAddressForm((prev) => ({ ...prev, country: e.target.value }))}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^[a-zA-Z\s]+$/.test(value)) {
                              setAddAddressForm({ ...addAddressForm, country: value });
                            }
                          }}
                          placeholder="India"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode <span className="text-red-500">*</span></Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          value={addAddressForm.pincode}
                          onChange={(e) => {
                            const value = e.target.value;
                            const val = value.replace(/\D/g, '');
                            setAddAddressForm({ ...addAddressForm, pincode: val });
                          }}
                          // onChange={(e) => setAddAddressForm((prev) => ({ ...prev, pincode: e.target.value }))}
                          required
                          maxLength={6}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="landmark">Landmark</Label>
                      <Input
                        id="landmark"
                        name="landmark"
                        value={addAddressForm.landmark}
                        onChange={(e) => setAddAddressForm((prev) => ({ ...prev, landmark: e.target.value }))}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        id="is_default"
                        name="is_default"
                        type="checkbox"
                        checked={!!addAddressForm.is_default}
                        onChange={(e) => setAddAddressForm((prev) => ({ ...prev, is_default: e.target.checked }))}
                        className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 focus:ring-2"
                      />
                      <Label htmlFor="is_default" className="text-sm font-medium">Make this default address</Label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddAddressModalOpen(false);
                        resetAddAddressForm();
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleAddNewAddress} className="flex-1">
                      Add Address
                    </Button>
                  </div>
                </div>
              </Modal>
            </CardContent>
          </Card>

          <Card className="mt-5">
            <CardHeader>
              <CardTitle>Company Bank Details</CardTitle>
            </CardHeader>
            <CardContent>
              <table width={"100%"} border={1}>
                <tr>
                  <th className="text-left">Account Holder</th>
                  <td>FEEL SAFE PRIVATE LIMITED</td>
                </tr>
                <tr>
                  <th className="text-left">Account Number</th>
                  <td>50200120760164</td>
                </tr>
                <tr>
                  <th className="text-left">IFSC</th>
                  <td>HDFC0000438</td>
                </tr>
                <tr>
                  <th className="text-left">Branch</th>
                  <td>NAJAFGARH</td>
                </tr>
                <tr>
                  <th className="text-left">Account Type</th>
                  <td>Current Account</td>
                </tr>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-4 border-b border-gray-100 last:border-b-0 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.f_image || item.product?.f_image || '/placeholder.png'}
                          alt={item.product_name || item.product?.name || 'Product'}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate dark:text-white mb-1">
                          {item.product_name || item.product?.name}
                        </h4>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {item?.variant_details?.attributes?.map((attr: any, index: number) => (
                          <Badge size="sm" variant="light" color="primary" key={index}>
                            {attr.attribute_name}: {attr.value}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{currency}{formattedAmount(item.price)}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="font-bold text-lg text-gray-600">
                          {currency}{formattedAmountCommas(item.subtotal || (item.quantity * item.price))}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-4 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total:</span>
                    <span>{currency}{formattedAmountCommas(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </>
  );
};

export default CheckoutForm;

