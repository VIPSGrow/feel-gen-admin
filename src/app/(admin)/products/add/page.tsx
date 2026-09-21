import AddProductPage from '@/components/product/AddProduct'
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title:
    "Add Product - Dashboard | Feel safe",
  description: "Feel Safe Description",
};

const page = () => {
  return (
    <>
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* <Button variant="outline" size="sm" onClick={() => window.history.back()} type="button">
            <ArrowLeft className="h-4 w-4" />
          </Button> */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight dark:text-gray-300">Add Product</h1>
            <p className="text-muted-foreground dark:text-gray-500 text-sm">Create a new product</p>
          </div>
        </div>
      </div>
    <AddProductPage />
    </>
  )
}

export default page
