"use client";
import React, { useState, useEffect } from 'react';
import { useModal } from '../../hooks/useModal';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import { useAuth } from '@/context/AuthContext';
import serverCallFuction from '@/lib/constantFunction';
import { Address, CreateAddressPayload } from '@/types/address';
import { Edit3, Plus } from 'lucide-react';

export default function UserAddressCard() {
  const { user } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<CreateAddressPayload & { stateId?: number; is_default?: boolean }>({
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
  });

  const [states, setStates] = useState<{ id: number; name: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await serverCallFuction('GET', 'api/ecom/d_addresses?type=distributor');
      if (res.status) {
        setAddresses(Array.isArray(res.data) ? res.data : res.address ? [res.address] : []);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
    });
  };

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
      setFormData((prev) => ({ ...prev, city: '' }));
      return;
    }
    try {
      setLoadingCities(true);
      const res = await serverCallFuction('GET', `api/static/cities/${stateId}`);
      if (res.status && Array.isArray(res.data)) {
        setCities(res.data);
        setFormData((prev) => ({ ...prev, city: '' }));
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    fetchStates();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (formData.stateId) {
      fetchCities(formData.stateId);
    }
  }, [formData.stateId]);




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (
        !formData.full_name ||
        !formData.phone ||
        !formData.address_line1 ||
        !formData.city ||
        !formData.state ||
        !formData.pincode
      ) {
        alert('Please fill all required fields: name, phone (10 digits), address, city, state, pincode');
        return;
      }

      if (!/^\d{10}$/.test(formData.phone)) {
        alert('Phone must be 10 digits');
        return;
      }

      if (formData.full_name.length < 3 || !/^[a-zA-Z\s]+$/.test(formData.full_name)) {
        alert('Full name must contain only letters and spaces');
        return;
      }

      const payload = {
        ...formData,
        // Backend expects these in the create/update payload
        stateId: undefined,
        cityId: undefined,
      };

      // Remove UI-only fields (typed safely)
      const payloadToSend = payload as Omit<typeof payload, 'stateId' | 'cityId'>;


      const endpoint = editingId
        ? `api/ecom/d_addresses/${editingId}?type=distributor`
        : 'api/ecom/d_addresses?type=distributor';

      const method: 'PUT' | 'POST' = editingId ? 'PUT' : 'POST';

      const res = await serverCallFuction(method, endpoint, payloadToSend);
      if (res.status) {
        await fetchAddresses();
        closeModal();
        resetForm();
        setCities([]);
        setEditingId(null);
      } else {
        alert(res.message || 'Failed to save address');
      }
    } catch (error) {
      alert('Error saving address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    resetForm();
    setCities([]);
    openModal();
  };

  const handleEdit = (address: Address) => {
    const stateName = address.state || '';
    const stateMatch = states.find((s) => s.name === stateName);
    const stateId = stateMatch?.id;

    setFormData({
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2,
      city: address.city,
      state: address.state,
      country: address.country,
      pincode: address.pincode,
      landmark: address.landmark,
      is_default: address.is_default,
      stateId,
    });

    setEditingId(address.id);
    openModal();

    if (stateId) fetchCities(stateId);
  };

  if (loading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <p>Loading addresses...</p>
      </div>
    );
  }

  const hasAddresses = addresses.length > 0;

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
              Addresses ({addresses.length})
            </h4>
            {!hasAddresses && user?.address && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Primary: {user.address}, {user.city || 'N/A'}, {user.pin || 'N/A'}
              </p>
            )}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {addresses.map((address) => (
                <div key={address.id} className="border border-gray-200 rounded-xl p-4 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-semibold text-gray-800 dark:text-white">{address.full_name}</h5>
                        {address.is_default && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/50 dark:text-green-200">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">📞 {address.phone}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{address.address_line1}</p>
                      {address.address_line2 && <p className="text-sm text-gray-600 dark:text-gray-400">{address.address_line2}</p>}
                      <p className="text-xs text-gray-500 mt-1">{address.city}, {address.state} - {address.pincode}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(address);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg dark:hover:bg-gray-700 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 lg:w-auto self-start"
          >
            <Plus className="w-4 h-4" />
            {editingId ? 'Update Address' : 'Add Address'}
          </button>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          closeModal();
          resetForm();
          setCities([]);
        }}
        className="max-w-2xl m-4"
      >
        <div className="p-6 bg-white rounded-3xl dark:bg-gray-900">
          <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <Label htmlFor="full_name">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  placeholder="Full Name"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^[a-zA-Z\s]+$/.test(value)) {
                      setFormData((prev) => ({ ...prev, full_name: value }));
                    }
                  }}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  type="tel"
                  placeholder="Enter phone number"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    // allow only 10 digits
                    if (val === '' || /^\d{0,10}$/.test(val)) {
                      setFormData((prev) => ({ ...prev, phone: val }));
                    }
                  }}
                  maxLength={10}
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <Label htmlFor="address_line1">Address Line 1 <span className="text-red-500">*</span></Label>
                <Input
                  id="address_line1"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleInputChange}
                  required
                  placeholder="eg.: Floor No., Landmark etc"
                />
              </div>

              <div className="lg:col-span-2">
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input
                  id="address_line2"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleInputChange}
                  placeholder="eg.: Street etc"
                />
              </div>

              <div>
                <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={(e) => {
                    const selectedIndex = e.target.selectedIndex;
                    const selectedOption = e.target.options[selectedIndex];
                    const stateId = Number(selectedOption.getAttribute('data-id'));
                    const stateName = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      state: stateName,
                      stateId,
                    }));
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700"
                  disabled={loadingStates}
                  required
                >
                  <option value="">Select State</option>
                  {loadingStates ? (
                    <option disabled>Loading...</option>
                  ) : (
                    states.map((state) => (
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
                  value={formData.city}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, city: e.target.value }));
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700"
                  disabled={loadingCities || !formData.state}
                  required
                >
                  <option value="">Select City</option>
                  {loadingCities ? (
                    <option disabled>Loading...</option>
                  ) : (
                    cities.map((city) => (
                      <option key={city.id} value={city.name.toString()}>
                        {city.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="India"
                  />
                </div>

                <div>
                  <Label htmlFor="pincode">Pincode <span className="text-red-500">*</span></Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val === '' || /^\d{0,6}$/.test(val)) {
                        setFormData((prev) => ({ ...prev, pincode: val }));
                      }
                    }}
                    required
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                />
              </div>

              <div className="lg:col-span-2 flex items-center space-x-2 pt-2">
                <input
                  id="is_default"
                  name="is_default"
                  type="checkbox"
                  checked={!!formData.is_default}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_default: e.target.checked }))}
                  className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 focus:ring-2"
                />
                <Label htmlFor="is_default" className="text-sm font-medium">
                  Make this default address
                </Label>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  closeModal();
                  resetForm();
                  setCities([]);
                }}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Saving...' : 'Save Address'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

