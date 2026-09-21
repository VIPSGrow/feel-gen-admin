import OrderDetail from '@/components/admin/orders/OrderDetail';
import React from 'react';

interface Props {
  params: { 'order-id': string }
}

const OrderDetailPage = ({ params }: Props) => {
  return (
    <>
      <OrderDetail />
    </>
  );
};

export default OrderDetailPage;
