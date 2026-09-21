import AllProducts from '@/components/shop/AllProducts'
import AppHeaderLogout from '@/layout/AppHeaderLogout'
import React from 'react'

const page = () => {
  return (
    <>
      <AppHeaderLogout />
      <AllProducts />
    </>
  )
}

export default page
