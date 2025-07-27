'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  QrCode, 
  Camera, 
  CheckCircle, 
  Navigation, 
  MapPin, 
  Package,
  Clock,
  Signature,
  Save,
  Wifi,
  WifiOff
} from 'lucide-react';
import { hashSignature, createOfflineDeliveryLog } from '@/lib/utils/delivery';
import QRScanner from '@/components/QRScanner';

interface ActiveDelivery {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  phone?: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  total: number;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED';
}

export default function ActiveDeliveryPage() {
  const { data: session } = useSession();
  const [currentDelivery, setCurrentDelivery] = useState<ActiveDelivery | null>(null);
  const [signature, setSignature] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Get current location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Location access denied:', error)
      );
    }

    // Load offline queue from localStorage
    const savedQueue = localStorage.getItem('deliveryOfflineQueue');
    if (savedQueue) {
      setOfflineQueue(JSON.parse(savedQueue));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      syncOfflineData();
    }
  }, [isOnline]);

  const handleQRScan = async (qrData: string) => {
    try {
      console.log('QR Code scanned:', qrData);
      
      // Extract order number from QR code URL
      const url = new URL(qrData);
      const orderNumber = url.pathname.split('/').pop();
      
      if (orderNumber) {
        await loadDeliveryOrder(orderNumber);
      } else {
        alert('Invalid QR code format. Please scan a valid order QR code.');
      }
    } catch (error) {
      console.error('Invalid QR code:', error);
      alert('Invalid QR code. Please scan a valid order QR code.');
    }
  };

  const handleQRError = (error: string) => {
    console.error('QR Scanner error:', error);
    // You can add user-friendly error handling here
  };

  const loadDeliveryOrder = async (orderNumber: string) => {
    try {
      const response = await fetch(`/api/orders/${orderNumber}`);
      if (response.ok) {
        const data = await response.json();
        const order = data.order;
        
        setCurrentDelivery({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.user.name,
          address: `${order.address.street}, ${order.address.city}`,
          phone: order.user.phone,
          items: order.items.map((item: any) => ({
            name: item.product.name,
            quantity: item.quantity,
          })),
          total: order.total,
          status: order.status,
        });
      } else {
        alert('Order not found or not assigned to you.');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      alert('Failed to load order details.');
    }
  };

  // Signature drawing functions
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL();
      setSignature(signatureData);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
      }
    }
    setSignature('');
  };

  const confirmDelivery = async () => {
    if (!currentDelivery || !signature) {
      alert('Please capture customer signature before confirming delivery.');
      return;
    }

    setIsProcessing(true);
    
    const deliveryData = {
      orderNumber: currentDelivery.orderNumber,
      status: 'DELIVERED',
      signatureHash: hashSignature(signature),
      gpsLocation: currentLocation ? JSON.stringify(currentLocation) : null,
      notes: deliveryNotes,
      timestamp: new Date().toISOString(),
    };

    if (isOnline) {
      try {
        const response = await fetch('/api/delivery/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deliveryData),
        });

        if (response.ok) {
          alert('Delivery confirmed successfully!');
          resetForm();
        } else {
          throw new Error('Server error');
        }
      } catch (error) {
        console.error('Failed to confirm delivery:', error);
        addToOfflineQueue(deliveryData);
      }
    } else {
      addToOfflineQueue(deliveryData);
    }
    
    setIsProcessing(false);
  };

  const addToOfflineQueue = (deliveryData: any) => {
    const offlineLog = createOfflineDeliveryLog(
      deliveryData.orderNumber,
      'COMPLETE_DELIVERY',
      deliveryData
    );
    
    const newQueue = [...offlineQueue, offlineLog];
    setOfflineQueue(newQueue);
    localStorage.setItem('deliveryOfflineQueue', JSON.stringify(newQueue));
    
    alert('Delivery saved offline. Will sync when connection is restored.');
    resetForm();
  };

  const syncOfflineData = async () => {
    if (offlineQueue.length === 0) return;

    console.log('Syncing offline data...');
    const successfulSyncs: string[] = [];

    for (const item of offlineQueue) {
      try {
        const actionData = JSON.parse(item.actionData);
        const response = await fetch('/api/delivery/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actionData),
        });

        if (response.ok) {
          successfulSyncs.push(item.id);
        }
      } catch (error) {
        console.error('Failed to sync item:', item.id, error);
      }
    }

    if (successfulSyncs.length > 0) {
      const remainingQueue = offlineQueue.filter(item => !successfulSyncs.includes(item.id));
      setOfflineQueue(remainingQueue);
      localStorage.setItem('deliveryOfflineQueue', JSON.stringify(remainingQueue));
      
      console.log(`Synced ${successfulSyncs.length} items successfully`);
    }
  };

  const resetForm = () => {
    setCurrentDelivery(null);
    setSignature('');
    setDeliveryNotes('');
    clearSignature();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Active Delivery</h1>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          {offlineQueue.length > 0 && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              {offlineQueue.length} pending sync
            </Badge>
          )}
        </div>
      </div>

      {/* QR Scanner Section */}
      {!currentDelivery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="h-5 w-5 mr-2" />
              Scan Order QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QRScanner 
              onScan={handleQRScan}
              onError={handleQRError}
            />
          </CardContent>
        </Card>
      )}

      {/* Current Delivery Details */}
      {currentDelivery && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{currentDelivery.orderNumber}</h3>
                <Badge className="mt-1 bg-blue-100 text-blue-800">
                  {currentDelivery.status}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Customer Information</h4>
                <p className="text-gray-600">{currentDelivery.customerName}</p>
                {currentDelivery.phone && (
                  <p className="text-gray-600">{currentDelivery.phone}</p>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Delivery Address
                </h4>
                <p className="text-gray-600">{currentDelivery.address}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Items</h4>
                <div className="space-y-2">
                  {currentDelivery.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span>×{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{formatCurrency(currentDelivery.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Confirmation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Signature className="h-5 w-5 mr-2" />
                Delivery Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Customer Signature *</h4>
                <div className="border border-gray-300 rounded-lg">
                  <canvas
                    ref={canvasRef}
                    width={300}
                    height={150}
                    className="w-full cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{ touchAction: 'none' }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <Button onClick={clearSignature} variant="outline" size="sm">
                    Clear
                  </Button>
                  <span className="text-sm text-gray-500">
                    {signature ? '✓ Signature captured' : 'Please sign above'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Delivery Notes (Optional)</h4>
                <Textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Any special notes about the delivery..."
                  rows={3}
                />
              </div>

              {currentLocation && (
                <div className="text-sm text-gray-500">
                  <Navigation className="h-4 w-4 inline mr-1" />
                  GPS Location captured
                </div>
              )}

              <Button
                onClick={confirmDelivery}
                disabled={!signature || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Delivery
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
