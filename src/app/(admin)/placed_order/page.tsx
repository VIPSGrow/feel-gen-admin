import PlacedOrder from '@/components/admin/orders/PlacedOrder';
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
    title: 'Placed Order - Admin | Feel Safe Private Limited',
    description: 'Mange your placed orders',
};


const page = () => {
    return (
        <>
            <PlacedOrder />
        </>
    )
}

export default page
