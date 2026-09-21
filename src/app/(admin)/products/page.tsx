"use client";

import React, { useState, useEffect } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import ProductListTable from '@/components/product/ProductListTable';
import { Product, ApiResponse } from '@/types/product';
import Button from '@/components/ui/button/Button';
import Alert from '@/components/ui/alert/Alert';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import Select from '@/components/form/Select';
import { hasPermission } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const { user } = useAuth()

  const fetchProducts = async (status = 'active') => {
    try {
      setLoading(true);
      const res = await serverCallFuction('GET', `api/products/products?status=${status}`) as ApiResponse<Product>;
      if (res.success && res.data) {
        setProducts(res.data);
        setError('');
      } else {
        setError(res.message || 'Failed to fetch products');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await serverCallFuction('DELETE', `api/products/products/${id}`);
      if (res.status !== false) {
        const d_data = res.data;
        if (selectedStatus === 'All') {
          setProducts(prev => prev.map(p => p.id === id ? { ...p, status: d_data.status } : p));
        } else {
          setProducts(prev => prev.filter(p => p.id !== id));
        }
        // setSelectedStatus('all');        
      } else {
        alert(res.message || 'Delete failed');
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleDeletePermanently = async (id: number) => {

    try {
      const res = await serverCallFuction('DELETE', `api/products/productDelete/${id}`);
      if (res.status !== false) {
        const d_data = res.data;
        if (selectedStatus === 'All') {
          setProducts(prev => prev.map(p => p.id === id ? { ...p, status: d_data.status } : p));
        } else {
          setProducts(prev => prev.filter(p => p.id !== id));
        }
        // setSelectedStatus('all');        
      } else {
        alert(res.message || 'Delete failed');
      }
    } catch (err) {
      alert('Delete failed');
    }

  }

  const handleRestore = async (id: number) => {
    try {
      const res = await serverCallFuction('PUT', `api/products/products/${id}`, { status: 'active' });
      if (res.success) {

        const d_data = res.data;
        if (selectedStatus === 'All') {
          setProducts(prev => prev.map(p => p.id === id ? { ...p, status: d_data.status } : p));
        } else {
          setProducts(prev => prev.filter(p => p.id !== id));
        }


      } else {
        setError("Something went wrong, restore failed");
      }
    } catch (e) {
      alert('Restore failed');
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);


  useEffect(() => {

    fetchProducts(selectedStatus);

  }, [selectedStatus]);

  // const filteredProducts = selectedStatus === 'all' 
  //   ? products 
  //   : products.filter(p => p.status === selectedStatus || (selectedStatus === 'trash' && p.status === 'inactive'));



  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-gray-300">Products</h1>
          <p className="text-muted-foreground dark:text-gray-500">Manage your products</p>
        </div>
        <div className="inline-flex items-center">
          {hasPermission(user?.role, 'add-product') &&
            <Link href="/products/add" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition mr-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
          }
          <div>
            <Select
              options={[
                { label: "All", value: 'all' },
                { label: "Active", value: 'active' },
                { label: "Inactive", value: 'inactive' },
                { label: "Trash", value: 'trash' }
              ]}
              placeholder="Product Status"
              defaultValue={selectedStatus}
              onChange={(value) => setSelectedStatus(value)}
            />
          </div>
        </div>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-900">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1200px]">
            <ProductListTable products={products} onDelete={handleDelete} onPermaDelete={handleDeletePermanently} onRestore={handleRestore} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 
