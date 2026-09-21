"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import serverCallFuction from '@/lib/constantFunction';
import { Product } from '@/types/product';
import Button from '@/components/ui/button/Button';
import Alert from '@/components/ui/alert/Alert';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';

import Image from 'next/image';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';

const ProductDetail = () => {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await serverCallFuction('GET', `api/products/products/${id}`);
        if (res.status !== false) {
          setProduct(res.data);
          setError('');
        } else {
          setError(res.message || 'Product not found');
        }
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error || !product) return <div className="p-6"><Alert variant="error" message={error || 'Product not found'} /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 ">{product.name}</h1>
          <p className="text-muted-foreground dark:text-gray-300">Product details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-lg p-5">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Status:</span> {product.status}</div>
            <div><span className="font-medium">Category:</span> {product.category?.name}</div>
            <div><span className="font-medium">Tax:</span> {product.tax?.name}</div>
            <div><span className="font-medium">Price:</span> ₹{product.price}</div>
            {product.discounted_price && <div><span className="font-medium">Discount:</span> ₹{product.discounted_price}</div>}
            <div><span className="font-medium">Created:</span> {new Date(product.created_at).toLocaleDateString()}</div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Featured Image</h2>
          <Image
            src={product.f_image?.startsWith('http') ? product.f_image : `${process.env.NEXT_PUBLIC_API_URL}${product.f_image || ''}` || '/images/product/product-01.jpg'}
            alt={product.name}
            width={80}
            height={80}
            className="rounded-lg object-cover w-full h-96"
            priority={false}
            onError={(e) => console.error('Detail page image failed:', product.f_image, e.target)}
          />
        </div>
      </div>

      {product.g_image && product.g_image.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Gallery Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.g_image.map((img, index) => (
              <Image
                key={index}
                src={img}
                alt={`Gallery ${index + 1}`}
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
            ))}
          </div>
        </div>
      )}

      {product.description && (
        <div className='bg-white rounded-lg p-5'>
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="whitespace-pre-wrap">{product.description}</p>
        </div>
      )}

      {product.variants && product.variants.length > 0 && (
        <div className='bg-white rounded-lg p-5'>
          <h2 className="text-xl font-semibold mb-4">Variants ({product.variants.length})</h2>
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="font-semibold">SKU</TableCell>
                  <TableCell isHeader className="font-semibold">Price</TableCell>
                  <TableCell isHeader className="font-semibold">Stock</TableCell>
                  <TableCell isHeader className="font-semibold">BV Points</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.variants.map((variant, index) => (
                  <TableRow key={index}>
                    <TableCell>{variant.sku}</TableCell>
                    <TableCell>₹{variant.price}</TableCell>
                    <TableCell>{variant.stock}</TableCell>
                    <TableCell>{variant.bv_point}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={() => navigation.navigate(`/products/${product.id}/edit`)}>

          <Edit className="h-4 w-4 mr-2" />
          Edit Product

        </Button>
      </div>
    </div>
  );
};

export default ProductDetail;

