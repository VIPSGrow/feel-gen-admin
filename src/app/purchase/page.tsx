"use client";

import React, { useState, useEffect } from 'react';
import { MOCK_PACKAGES, type PurchasePackage } from '@/types/purchase';
import Button from '@/components/ui/button/Button';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card/Card';



import { CheckCircle, X } from 'lucide-react'; // assume lucide installed, fallback SVG if not
import Badge from '@/components/ui/badge/Badge';
import serverCallFuction from '@/lib/constantFunction';
import AppHeader from '@/layout/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface PurchaseModalProps {
  package: PurchasePackage;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (qty: number) => void;
}

const PurchasePage = () => {
  const [packages, setPackages] = useState<PurchasePackage[]>([]);

  const [message, setMessage] = useState('');
  const router = useRouter();

  const { updateUserProfile } = useAuth();

  useEffect(() => {
    fetchPackage()
  }, []);

  // handlefetchpackate
  const fetchPackage = async () => {
    try {

      const res = await serverCallFuction('GET', 'api/plan/');
      
      if (res.success) {
        setPackages(res.data)
      } else {
        alert('Something went wrong!')
      }
    } catch (error) {
      console.error("error - ", error);

      alert('Something went wrong!')
    }
  }

  const handlePO = async (packageId, amount = 0, paymentMethod = 'wallet') => {
    try {


      const res = await serverCallFuction('POST', 'api/plan/place-po',
        {
          packageId,
          amount,
          paymentMethod
        }
      )

      if (res.success) {
        alert(res.message);
        await updateUserProfile(res.user);
        router.replace("/");
      } else {
        alert("Something went wrong!");
      }

    } catch (error) {
      console.log("error in PO - ", error);

    }


  }


  return (
    <>
      <AppHeader />
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl mb-0 font-bold tracking-tight dark:text-gray-300">Purchase Packages</h1>
        <p className="text-muted-foreground dark:text-gray-500">Choose your distributor level package</p>

        <div id="purchase-toast" className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 hidden flex items-center gap-2">
          <CheckCircle size={20} />
          {message}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader className="pb-2 text-center">
                <img
                  src={pkg.image || '/images/cards/card-01.png'}
                  alt={pkg.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardTitle className="text-lg mb-4">{pkg.tag}</CardTitle>
                <hr className='mb-4' />
                <Badge color={pkg.is_trial ? "success" : "primary"}>
                  {pkg.is_trial ? 'Trial' : 'KYC Required'}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 whitespace-pre-line">{pkg.description}</CardDescription>
                <div className="space-y-2 mb-6">
                  <div className="text-2xl font-bold text-primary">₹{pkg.price.toLocaleString()}</div>
                  {/* <div className="text-sm text-muted-foreground">BV Points: {pkg.bv_points.toLocaleString()} | Stock: {pkg.stock}</div> */}
                </div>
                <Button className="w-full group-hover:bg-primary/90" onClick={() => {
                  router.push(`/checkout?packageId=${pkg.id}&amount=${pkg.price}`)
                }}>
                  Purchase Now
                </Button>

              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>

  );
};

export default PurchasePage;

