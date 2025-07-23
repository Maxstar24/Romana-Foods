'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, Truck, Package, MapPin, Phone, Mail, ArrowLeft, Download } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  orderNumber: string;
  qrCode: string;
  trackingHash: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  adminNotes?: string;
  user: {
    name: string;
    email: string;
  };
  address: {
    name: string;
    phone: string;
    street: string;
    city: string;
    region: string;
    zipCode?: string;
    country: string;
  };
  items: OrderItem[];
  statusHistory: Array<{
    status: string;
    notes?: string;
    createdAt: string;
  }>;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusIcons: Record<string, any> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: Clock,
};

export default function OrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderNumber = params.orderNumber as string;
  const isSuccess = searchParams.get('success') === 'true';
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const downloadQRCode = () => {
    if (!order) return;
    
    const link = document.createElement('a');
    link.href = order.qrCode;
    link.download = `romana-order-${order.orderNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadReceipt = async () => {
    if (!order) return;
    
    try {
      const response = await fetch(`/api/orders/${order.orderNumber}/receipt`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `romana-receipt-${order.orderNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const copyTrackingInfo = () => {
    if (!order) return;
    
    const trackingInfo = `Order: ${order.orderNumber}\nTracking URL: ${window.location.origin}/track\nTracking Hash: ${order.trackingHash || 'Not available'}`;
    navigator.clipboard.writeText(trackingInfo);
  };

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderNumber}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        setError('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(price); // Price is already in TZS, no conversion needed
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-organic flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400 animate-pulse" />
          </div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-organic flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/store">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[order.status];

  return (
    <div className="min-h-screen bg-organic">
      {/* Success Banner */}
      {isSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border-b border-green-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-800">
                <strong>Order placed successfully!</strong> You will receive a confirmation email shortly.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/store">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Store
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order #{orderNumber}</h1>
                <p className="text-gray-600 mt-1">Placed on {formatDate(order.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={copyTrackingInfo}>
                <Package className="h-4 w-4 mr-2" />
                Copy Tracking Info
              </Button>
              {order.status === 'DELIVERED' && (
                <Button onClick={downloadReceipt}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
              )}
              <Badge className={statusColors[order.status]}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {order.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {item.product.images.length > 0 ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm font-medium text-primary">
                          {formatPrice(item.price)} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{order.address.name}</p>
                  <p className="text-gray-600">{order.address.street}</p>
                  <p className="text-gray-600">
                    {order.address.city}, {order.address.region}
                    {order.address.zipCode && ` ${order.address.zipCode}`}
                  </p>
                  <p className="text-gray-600">{order.address.country}</p>
                  <div className="flex items-center mt-4 space-x-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-1" />
                      {order.address.phone}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & QR Code */}
          <div className="space-y-6">
            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle>Order QR Code</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-48 h-48 mx-auto mb-4 bg-white p-4 rounded-lg border">
                  <Image
                    src={order.qrCode}
                    alt="Order QR Code"
                    width={192}
                    height={192}
                    className="w-full h-full"
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Show this QR code for quick order lookup or delivery verification
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" onClick={downloadQRCode} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </Button>
                  {order.trackingHash && (
                    <div className="text-xs text-gray-500 mt-4">
                      <p className="font-medium">Tracking Hash:</p>
                      <p className="font-mono break-all">{order.trackingHash.substring(0, 16)}...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{formatPrice(order.shippingCost)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(order.total)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Payment Status</p>
                  <Badge className={order.paymentStatus === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {order.paymentStatus}
                  </Badge>
                </div>

                {order.adminNotes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Admin Notes</p>
                      <p className="text-sm text-gray-600">{order.adminNotes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Order Status History */}
            {order.statusHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.statusHistory.map((history, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        <div>
                          <p className="font-medium text-sm">{history.status}</p>
                          {history.notes && (
                            <p className="text-xs text-gray-600">{history.notes}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {formatDate(history.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
