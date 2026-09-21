import OrderDetailRec from '@/components/admin/orders/OrderDetailRec';
import React from 'react';

interface Props {
  params: { 'order-id': string }
}

const OrderDetailPage = ({ params }: Props) => {
  return (
    <>
      <OrderDetailRec />
    </>
  );
};

export default OrderDetailPage;
