'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, Truck, MapPin, Phone, User, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  region: string;
  zipCode: string;
  country: string;
}

interface PaymentMethod {
  type: 'cash_on_delivery' | 'mobile_money' | 'bank_transfer';
  details?: string;
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: session?.user?.name || '',
    phone: '',
    street: '',
    city: '',
    region: '',
    zipCode: '',
    country: 'Tanzania',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: 'cash_on_delivery',
  });

  const [shippingCost, setShippingCost] = useState(5000); // Default shipping cost

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/checkout');
    }
  }, [session, router]);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/store');
    }
  }, [items, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(price / 100); // Convert from cents to main currency unit
  };

  const calculateShippingCost = () => {
    // Simple shipping calculation based on region
    const regionCosts: Record<string, number> = {
      'Dar es Salaam': 3000,
      'Arusha': 5000,
      'Mwanza': 6000,
      'Dodoma': 5500,
      'Mbeya': 7000,
      'Tanga': 4500,
      'Morogoro': 4000,
      'Iringa': 6500,
      'Tabora': 8000,
      'Kilimanjaro': 5500,
    };

    const cost = regionCosts[shippingAddress.region] || 5000;
    setShippingCost(cost);
  };

  useEffect(() => {
    if (shippingAddress.region) {
      calculateShippingCost();
    }
  }, [shippingAddress.region]);

  const handleSubmitOrder = async () => {
    setIsLoading(true);
    
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress,
        paymentMethod,
        subtotal: total,
        shippingCost,
        total: total + shippingCost,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        clearCart();
        router.push(`/orders/${order.orderNumber}?success=true`);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session || items.length === 0) {
    return (
      <div className="min-h-screen bg-organic flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-organic">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link href="/store">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
              <p className="text-gray-600 mt-1">Complete your order</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={shippingAddress.name}
                      onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      placeholder="+255 123 456 789"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                      placeholder="Dar es Salaam"
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Select 
                      value={shippingAddress.region} 
                      onValueChange={(value) => setShippingAddress({...shippingAddress, region: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dar es Salaam">Dar es Salaam</SelectItem>
                        <SelectItem value="Arusha">Arusha</SelectItem>
                        <SelectItem value="Mwanza">Mwanza</SelectItem>
                        <SelectItem value="Dodoma">Dodoma</SelectItem>
                        <SelectItem value="Mbeya">Mbeya</SelectItem>
                        <SelectItem value="Tanga">Tanga</SelectItem>
                        <SelectItem value="Morogoro">Morogoro</SelectItem>
                        <SelectItem value="Iringa">Iringa</SelectItem>
                        <SelectItem value="Tabora">Tabora</SelectItem>
                        <SelectItem value="Kilimanjaro">Kilimanjaro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code (Optional)</Label>
                    <Input
                      id="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                      placeholder="12345"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                       onClick={() => setPaymentMethod({type: 'cash_on_delivery'})}>
                    <input
                      type="radio"
                      checked={paymentMethod.type === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod({type: 'cash_on_delivery'})}
                      className="text-primary"
                    />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">Pay when your order is delivered</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                       onClick={() => setPaymentMethod({type: 'mobile_money'})}>
                    <input
                      type="radio"
                      checked={paymentMethod.type === 'mobile_money'}
                      onChange={() => setPaymentMethod({type: 'mobile_money'})}
                      className="text-primary"
                    />
                    <div>
                      <p className="font-medium">Mobile Money</p>
                      <p className="text-sm text-gray-600">M-Pesa, Tigo Pesa, Airtel Money</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                       onClick={() => setPaymentMethod({type: 'bank_transfer'})}>
                    <input
                      type="radio"
                      checked={paymentMethod.type === 'bank_transfer'}
                      onChange={() => setPaymentMethod({type: 'bank_transfer'})}
                      className="text-primary"
                    />
                    <div>
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-sm text-gray-600">Direct bank transfer</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total + shippingCost)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleSubmitOrder}
                  disabled={isLoading || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.region}
                >
                  {isLoading ? 'Processing...' : 'Place Order'}
                </Button>

                <p className="text-xs text-gray-600 text-center">
                  By placing your order, you agree to our terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
