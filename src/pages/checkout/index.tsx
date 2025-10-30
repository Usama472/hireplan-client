import React from 'react';
import CustomCheckout from '@/components/checkout/CustomCheckout';
import { useSearchParams } from 'react-router-dom';
import type { FC } from 'react';

const CheckoutPage: FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // 'custom' or 'update'
  const amount = searchParams.get('amount');
  
  return <CustomCheckout mode={mode || undefined} customAmount={amount ? parseFloat(amount) : undefined} />;
};

export default CheckoutPage;
