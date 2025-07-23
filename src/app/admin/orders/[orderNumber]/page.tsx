'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Package, User, MapPin, Clock, DollarSign, FileText, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod?: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  statusHistory: Array<{
    id: string;
    status: string;
    notes?: string;
    createdAt: string;
  }>;
}

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (orderNumber) {
      fetchOrder();
    }
  }, [session, status, router, orderNumber]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderNumber}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setNewStatus(data.order.status);
        setNewPaymentStatus(data.order.paymentStatus);
        setAdminNotes(data.order.adminNotes || '');
      } else {
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!order) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/orders/${orderNumber}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: newPaymentStatus,
          adminNotes,
        }),
      });

      if (response.ok) {
        await fetchOrder(); // Refresh order data
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PREPARING':
        return 'bg-purple-100 text-purple-800';
      case 'SHIPPED':
        return 'bg-orange-100 text-orange-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN' || !order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Orders
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
                <div className="flex items-center space-x-3 mt-2">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {item.product.images[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{formatCurrency(order.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Contact Details</h4>
                    <p><strong>Name:</strong> {order.user.name}</p>
                    <p><strong>Email:</strong> {order.user.email}</p>
                    {order.user.phone && <p><strong>Phone:</strong> {order.user.phone}</p>}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Payment Method</h4>
                    <p>{order.paymentMethod || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Addresses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Addresses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <div className="text-sm space-y-1">
                      <p>{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                      <p>{order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                      <p>{order.shippingAddress.phone}</p>
                    </div>
                  </div>
                  {order.billingAddress && (
                    <div>
                      <h4 className="font-medium mb-2">Billing Address</h4>
                      <div className="text-sm space-y-1">
                        <p>{order.billingAddress.fullName}</p>
                        <p>{order.billingAddress.street}</p>
                        <p>{order.billingAddress.city}, {order.billingAddress.state}</p>
                        <p>{order.billingAddress.postalCode}</p>
                        <p>{order.billingAddress.country}</p>
                        <p>{order.billingAddress.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Status Management */}
            <Card>
              <CardHeader>
                <CardTitle>Manage Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Order Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="PREPARING">Preparing</SelectItem>
                      <SelectItem value="SHIPPED">Shipped</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Payment Status</label>
                  <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Admin Notes</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this order..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleUpdateOrder}
                  disabled={updating}
                  className="w-full"
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Order
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <p><strong>Created:</strong></p>
                    <p className="text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  
                  {order.confirmedAt && (
                    <div className="text-sm">
                      <p><strong>Confirmed:</strong></p>
                      <p className="text-gray-600">{new Date(order.confirmedAt).toLocaleString()}</p>
                    </div>
                  )}
                  
                  {order.shippedAt && (
                    <div className="text-sm">
                      <p><strong>Shipped:</strong></p>
                      <p className="text-gray-600">{new Date(order.shippedAt).toLocaleString()}</p>
                    </div>
                  )}
                  
                  {order.deliveredAt && (
                    <div className="text-sm">
                      <p><strong>Delivered:</strong></p>
                      <p className="text-gray-600">{new Date(order.deliveredAt).toLocaleString()}</p>
                    </div>
                  )}

                  <div className="text-sm">
                    <p><strong>Last Updated:</strong></p>
                    <p className="text-gray-600">{new Date(order.updatedAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Status History */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium mb-3">Status History</h4>
                    <div className="space-y-2">
                      {order.statusHistory.map((history) => (
                        <div key={history.id} className="text-sm">
                          <div className="flex justify-between">
                            <Badge className={getStatusColor(history.status)} variant="outline">
                              {history.status}
                            </Badge>
                            <span className="text-gray-500">
                              {new Date(history.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {history.notes && (
                            <p className="text-gray-600 mt-1">{history.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
