"use client";
import React from 'react'
import OrderTable from './OrderTable'

const PlacedOrder = () => {
    return (
        <OrderTable
            apiEndpoint="api/orders/placed"
            title="Placed Orders"
            description="Manage placed orders to company."
            role="distributor"
        />
    )
}

export default PlacedOrder
