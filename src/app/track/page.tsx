'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Camera, Search, ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleManualTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate order exists
      const response = await fetch(`/api/orders/${orderNumber}`);
      if (response.ok) {
        router.push(`/orders/${orderNumber}`);
      } else {
        setError('Order not found. Please check your order number.');
      }
    } catch (error) {
      setError('Failed to track order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startQRScanner = async () => {
    setIsScanning(true);
    setError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      setError('Camera access denied or not available');
      setIsScanning(false);
    }
  };

  const stopQRScanner = () => {
    setIsScanning(false);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    // Here you would integrate a QR code library like 'qr-scanner' or 'jsqr'
    // For now, we'll show a placeholder message
    setError('QR scanning functionality coming soon. Please use manual entry.');
    stopQRScanner();
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
              <p className="text-gray-600 mt-1">Enter your order number or scan QR code</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Manual Entry Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Track by Order Number
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualTrack} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input
                      id="orderNumber"
                      placeholder="e.g., RN17219458123456"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      className="text-center text-lg font-mono"
                    />
                    <p className="text-sm text-gray-600">
                      Your order number starts with &apos;RN&apos; and can be found in your email confirmation
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={loading || !orderNumber.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Package className="h-4 w-4 mr-2 animate-spin" />
                        Tracking...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Track Order
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-organic text-gray-500">Or</span>
            </div>
          </div>

          {/* QR Scanner Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="h-5 w-5 mr-2" />
                  Scan QR Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isScanning ? (
                  <div className="text-center py-8">
                    <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-6">
                      Scan the QR code from your order confirmation or receipt
                    </p>
                    <Button onClick={startQRScanner} size="lg">
                      <Camera className="h-4 w-4 mr-2" />
                      Start Camera
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <video
                        ref={videoRef}
                        className="w-full h-64 bg-black rounded-lg"
                        playsInline
                      />
                      <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                        <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-primary rounded-tl-lg"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-primary rounded-tr-lg"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-primary rounded-bl-lg"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-primary rounded-br-lg"></div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button onClick={captureAndScan} className="flex-1">
                        <QrCode className="h-4 w-4 mr-2" />
                        Scan QR Code
                      </Button>
                      <Button onClick={stopQRScanner} variant="outline">
                        Cancel
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-600 text-center">
                      Position the QR code within the frame and tap scan
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Help Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Your order number can be found in your email confirmation</p>
                  <p>• QR codes are included in your order receipt</p>
                  <p>• If you have an account, you can view all orders in <Link href="/orders" className="underline font-medium">My Orders</Link></p>
                  <p>• If you&apos;re having trouble tracking your order, contact support</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Hidden canvas for QR processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
