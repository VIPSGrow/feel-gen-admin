"use client";


import ShopProductDetails from '@/components/shop/ShopProductDetails';
import AppHeaderLogout from '@/layout/AppHeaderLogout'
import React from 'react'

const page = () => {
  return (
    <>
      <AppHeaderLogout />
      <ShopProductDetails />
    </>
  )
}

export default page