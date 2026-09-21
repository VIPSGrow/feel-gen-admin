"use client"

import { use } from "react"; // Import the use hook
import EditProductPage from '@/components/product/EditProduct';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/button/Button';

// Note: Metadata stays in a separate layout.tsx or a Server Component. 
// You cannot export metadata from a file with "use client".

const EditProductWrapper = ({ params }: { params: Promise<{ id: string }> }) => {
  // Unwrap the params promise
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-gray-300">Edit Product</h1>
          <p className="text-muted-foreground dark:text-gray-500 text-sm">Update existing product details</p>
        </div>
      </div>
      <EditProductPage productId={id} />
    </>
  );
};

export default EditProductWrapper;