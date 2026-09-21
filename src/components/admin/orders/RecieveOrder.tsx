"use client";
import React from 'react'
import OrderTable from './OrderTable'

const RecieveOrder = () => {
    return (
        <OrderTable
            apiEndpoint="api/orders/received"
            title="Received Orders"
            description="Manage received orders from company."
            type='recieve'
        />
    )
}

export default RecieveOrder
