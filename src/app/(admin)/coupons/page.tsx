"use client";
import React, { useState, useEffect } from 'react';
import { useModal } from '@/hooks/useModal';
import serverCallFuction, { date_formate } from '@/lib/constantFunction';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Pagination from '@/components/tables/Pagination';
import { Pencil, Trash2, Plus, RefreshCcw } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Product } from '@/types/product';
import MultiSelect from '@/components/ui/select/MultiSelect';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_amount: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  valid_from: string;
  expires_at: string;
  applicable_products?: string[];
  product_names?: string[];
  applicable_users?: string[];
  status: 'active' | 'inactive';
  created_at?: string;
}

interface FormData {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_amount: number;
  min_order_amount: number;
  max_discount_amount: number;
  usage_limit: number;
  valid_from: string;
  expires_at: string;
  applicable_products: string[];
  applicable_users: string[];
  status: 'active' | 'inactive';
  product_names: string[];
}

const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productMode, setProductMode] = useState<'all' | 'specific'>('all');
  const [userMode, setUserMode] = useState<'all' | 'specific'>('all');
  const [users, setUsers] = useState<Array<{ id: string | number; username?: string; email?: string; phone?: string; full_name?: string }>>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    code: '',
    discount_type: 'percentage',
    discount_amount: 0,
    min_order_amount: 0,
    max_discount_amount: 0,
    usage_limit: 0,
    valid_from: '',
    expires_at: '',
    applicable_products: [],
    applicable_users: [],
    status: 'active',
    product_names: []
  });

  const { isOpen: modalOpen, openModal, closeModal } = useModal();

  const resetForm = () => {
    setProductMode('all');
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_amount: 0,
      min_order_amount: 0,
      max_discount_amount: 0,
      usage_limit: 0,
      valid_from: '',
      expires_at: '',
      applicable_products: [],
      applicable_users: [],
      status: 'active',
      product_names: []
    });
    setEditingCoupon(null);
  };

  const fetchCoupons = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await serverCallFuction('GET', `api/coupons?page=${page}&limit=10`);
      if (response && response.status !== false) {
        setCoupons(response.data || []);
        setTotalPages(response.totalPages || 1);
      } else {
        setError(response?.message || 'Failed to fetch coupons');
      }
    } catch (err) {
      setError('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons(currentPage);
  }, [currentPage]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discount_amount || !formData.valid_from || !formData.expires_at) {
      alert('Please fill required fields');
      return;
    }

    const url = editingCoupon ? `api/coupons/${editingCoupon.id}` : 'api/coupons';
    const method = editingCoupon ? 'PUT' : 'POST';

    // Backend expects applicable_users as JSON array (same idea as product selection).
    // We stringify the array so APIs that parse JSON strings will work.
    const payload = {
      ...formData,
      applicable_users: JSON.stringify(formData.applicable_users || []),
      applicable_products: formData.applicable_products || []
    };

    if (editingCoupon) {
      // Remove fields that the backend shouldn't receive during an update
      const payloadAny = payload as Record<string, unknown>;
      delete payloadAny.index;
      delete payloadAny.actual_used_count;
      delete payloadAny.product_names;
      delete payloadAny.updated_at;

      // Optional: If 'id' is in formData but already in the URL, you might remove it too
      // delete (payload as any).id; 
    }

    try {
      const response = await serverCallFuction(method, url, payload);
      if (response && response.status !== false) {
        alert(editingCoupon ? 'Coupon updated!' : 'Coupon created!');
        closeModal();
        fetchCoupons(currentPage);
        resetForm();
      } else {
        alert(response?.message || 'Operation failed');
      }
    } catch (err) {
      alert('Operation failed');
    }
  };

  const handleEdit = (coupon: Coupon) => {
    const applicable = coupon.applicable_products || [];
    setProductMode(applicable.length === 0 ? 'all' : 'specific');

    setFormData({
      ...coupon,
      min_order_amount: coupon.min_order_amount || 0,
      max_discount_amount: coupon.max_discount_amount || 0,
      usage_limit: coupon.usage_limit || 0,
      applicable_products: applicable,
      applicable_users: normalizeIdArray(coupon.applicable_users as unknown),
      product_names: coupon.product_names || []
    });

    setEditingCoupon(coupon);
    openModal();
  };

  const restoreCoupon = async (coupon: Coupon) => {
    // setProductMode(applicable.length === 0 ? 'all' : 'specific');
    // setFormData({
    //   ...coupon,
    //   min_order_amount: coupon.min_order_amount || 0,
    //   max_discount_amount: coupon.max_discount_amount || 0,
    //   usage_limit: coupon.usage_limit || 0,
    //   applicable_products: applicable,
    //   applicable_users: coupon.applicable_users || [],
    //   product_names: coupon.product_names || []
    // });
    // setEditingCoupon(coupon);
    // openModal();

    const url = `api/coupons/${coupon.id}`
    const res = await serverCallFuction('PUT', url, { status: 'active' });
    if (res.success) {
      alert('Coupon restored!');
      fetchCoupons(currentPage);
    }
  };

  // Sync applicable_products when productMode changes
  useEffect(() => {
    if (productMode === 'all') {
      setFormData(prev => ({ ...prev, applicable_products: [] }));
    }
  }, [productMode]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const response = await serverCallFuction('DELETE', `api/coupons/${id}`);
      if (response && response.status !== false) {
        alert('Coupon deleted!');
        fetchCoupons(currentPage);
      } else {
        alert(response?.message || 'Delete failed');
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const openCreateModal = () => {
    resetForm();
    openModal();
  };

  const parseJsonSafe = (str: string) => {
    try {
      return JSON.parse(str || '[]');
    } catch {
      return [];
    }
  };

  const normalizeIdArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.map(v => v?.toString?.() ?? '').filter(Boolean);
    }
    if (typeof value === 'string') {
      const parsed = parseJsonSafe(value);
      if (Array.isArray(parsed)) {
        return parsed.map(v => v?.toString?.() ?? '').filter(Boolean);
      }
      return value ? [value] : [];
    }
    return [];
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);

      interface UsersResponse {
        success?: boolean;
        status?: boolean;
        data?: Array<{ id: string | number; username?: string; email?: string; phone?: string; full_name?: string }>;
        users?: Array<{ id: string | number; username?: string; email?: string; phone?: string; full_name?: string }>;
        message?: string;
      }


      const res = await serverCallFuction<UsersResponse>(

        'GET',
        // Prefer existing ecom-users style endpoints used elsewhere in the app.
        // If your backend uses another route, adjust here.
        'api/users/all'
      );

      const resObj = res as unknown as { data?: unknown; users?: unknown };
      const list = (resObj?.data && Array.isArray(resObj.data) ? resObj.data : (resObj?.users && Array.isArray(resObj.users) ? resObj.users : [])) as Array<{ id: string | number; username?: string; email?: string; phone?: string; full_name?: string }>;
      setUsers(Array.isArray(list) ? list : []);
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchProducts = async () => {

    try {
      setProductsLoading(true);
      interface ProductResponse {
        success: boolean;
        data: Product[];
      }
      const res = await serverCallFuction('GET', 'api/products/products?status=active') as ProductResponse;
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);


  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-theme dark:text-gray-300">Coupons</h2>
          <p className="text-muted-foreground dark:text-gray-400">Manage your coupons</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">{error}</div>
      )}

      <div className="rounded-lg border bg-white overflow-hidden dark:bg-gray-900">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Code</TableCell>
              {/* <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Type</TableCell> */}
              <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Amount</TableCell>
              <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Min Order</TableCell>
              <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Usage Limit</TableCell>
              <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Products</TableCell>
              <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Valid From</TableCell>
              <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Expires</TableCell>
              <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Status</TableCell>
              <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 font-bold">{coupon.code}</TableCell>
                {/* <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{coupon.discount_type}</TableCell> */}
                <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 ">
                  <Badge color={coupon.discount_type === "percentage" ? 'success' : 'error'} className='font-bold'>{
                    coupon.discount_type === "percentage" ? coupon.discount_amount + "%" : "₹" + coupon.discount_amount
                  }</Badge>

                </TableCell>
                <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">₹{coupon.min_order_amount || 0}</TableCell>
                <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{coupon.usage_limit || 'Unlimited'}</TableCell>
                <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{coupon.product_names?.join(", ") || 'All'}</TableCell>
                <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{date_formate(coupon.valid_from)}</TableCell>
                <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{date_formate(coupon.expires_at)}</TableCell>
                <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                  <Badge variant="solid" color={coupon.status === 'active' ? 'success' : 'error'}>
                    {coupon.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 space-x-2">
                  {/* Backend status may include 'trash' but UI type currently only has active/inactive */}
                  {coupon.status === ('trash' as any) ? <>

                    <Button variant="outline" size="sm" onClick={() => restoreCoupon(coupon)}>
                      <RefreshCcw className="h-4 w-4" />
                    </Button></> : <>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(coupon)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(coupon.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>}
                </TableCell>
              </TableRow>
            ))}
            {coupons.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">No coupons found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="p-4 border-t bg-muted/50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            closeModal(); resetForm();
          }}
          className='max-w-lg mx-auto'
        >

          <div className="p-6">
            <h2 className="text-lg font-bold mb-6">
              {/* Create Coupon */}
              {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </h2>

            <div className='space-y-4'>
              <form onSubmit={handleCreateOrUpdate} className="p-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      defaultValue={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="COUPON123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount_type">Discount Type *</Label>
                    <select
                      id="discount_type"
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="percentage">Percent %</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="discount_amount">Discount Amount *</Label>
                    <Input
                      id="discount_amount"
                      type="number"
                      defaultValue={formData.discount_amount}
                      onChange={(e) => setFormData({ ...formData, discount_amount: Number(e.target.value) })}
                      placeholder="10 or 100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="min_order_amount">Min Order Amount</Label>
                    <Input
                      id="min_order_amount"
                      type="number"
                      defaultValue={formData.min_order_amount}
                      onChange={(e) => setFormData({ ...formData, min_order_amount: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_discount_amount">Max Discount Amount</Label>
                    <Input
                      id="max_discount_amount"
                      type="number"
                      defaultValue={formData.max_discount_amount}
                      onChange={(e) => setFormData({ ...formData, max_discount_amount: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="usage_limit">Usage Limit</Label>
                    <Input
                      id="usage_limit"
                      type="number"
                      defaultValue={formData.usage_limit}
                      onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="valid_from">Valid From *</Label>
                    <Input
                      id="valid_from"
                      type="date"
                      defaultValue={formData.valid_from}
                      onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expires_at">Expires At *</Label>
                    <Input
                      id="expires_at"
                      type="date"
                      defaultValue={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Applicable Products</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        id="product-all"
                        type="radio"
                        value="all"
                        checked={productMode === 'all'}
                        onChange={(e) => {
                          setProductMode('all' as const);
                          setFormData({ ...formData, applicable_products: [] });
                        }}
                        className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 focus:ring-brand-500 dark:focus:ring-brand-400 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700"
                      />
                      <Label htmlFor="product-all" className="text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">All Products</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        id="product-specific"
                        type="radio"
                        value="specific"
                        checked={productMode === 'specific'}
                        onChange={(e) => setProductMode('specific' as const)}
                        className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 focus:ring-brand-500 dark:focus:ring-brand-400 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700"
                      />
                      <Label htmlFor="product-specific" className="text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">Specific Products</Label>
                    </div>
                  </div>
                  {productMode === 'specific' && (
                    <div className="pt-2">
                      <MultiSelect
                        options={products.map(p => ({ value: p.id.toString(), label: p.name }))}
                        value={formData.applicable_products}
                        onChange={(vals) => setFormData({ ...formData, applicable_products: vals })}
                        placeholder="Select products"
                        searchable={true}
                      />
                    </div>
                  )}
                  {productsLoading && <p className="text-sm text-gray-500">Loading products...</p>}
                </div>
                <div className="space-y-2">
                  <Label>Applicable Users</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        id="user-all"
                        type="radio"
                        value="all"
                        checked={userMode === 'all'}
                        onChange={() => {
                          setUserMode('all');
                          setFormData(prev => ({ ...prev, applicable_users: [] }));
                        }}
                        className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 focus:ring-brand-500 dark:focus:ring-brand-400 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700"
                      />
                      <Label htmlFor="user-all" className="text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">
                        All Users
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        id="user-specific"
                        type="radio"
                        value="specific"
                        checked={userMode === 'specific'}
                        onChange={() => setUserMode('specific')}
                        className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 focus:ring-brand-500 dark:focus:ring-brand-400 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700"
                      />
                      <Label htmlFor="user-specific" className="text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">
                        Specific Users
                      </Label>
                    </div>
                  </div>

                  {userMode === 'specific' && (
                    <div className="pt-2">
                      <MultiSelect
                        options={users.map(u => ({
                          value: u.id.toString(),
                          label: u.full_name || u.username || u.email || u.phone || `User ${u.id}`
                        }))}
                        value={formData.applicable_users}
                        onChange={(vals: string[]) => setFormData(prev => ({ ...prev, applicable_users: vals }))}
                        placeholder="Select users"
                        searchable={true}
                      />
                      {usersLoading && <p className="text-sm text-gray-500 mt-2">Loading users...</p>}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingCoupon ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { closeModal(); resetForm(); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CouponsPage;

