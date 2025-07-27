'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check camera permission on mount
  useEffect(() => {
    checkCameraPermission();
    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported on this device');
        setHasPermission(false);
        return;
      }

      // Check permission status
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (permission.state === 'denied') {
          setError('Camera access denied. Please enable camera permissions.');
          setHasPermission(false);
          return;
        }
      }

      setHasPermission(true);
    } catch (err) {
      console.error('Error checking camera permission:', err);
      setError('Unable to check camera permissions');
      setHasPermission(false);
    }
  };

  const startScanning = async () => {
    if (!hasPermission) {
      await checkCameraPermission();
      if (!hasPermission) return;
    }

    setError('');
    setIsScanning(true);

    try {
      // Request camera access with optimal settings for QR scanning
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();

        // Wait for video to load before starting scan loop
        videoRef.current.onloadedmetadata = () => {
          startScanLoop();
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown camera error';
      
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setError('Camera access denied. Please allow camera permissions and try again.');
      } else if (errorMessage.includes('NotFoundError')) {
        setError('No camera found on this device.');
      } else if (errorMessage.includes('NotReadableError')) {
        setError('Camera is already in use by another application.');
      } else {
        setError(`Camera error: ${errorMessage}`);
      }
      
      setIsScanning(false);
      onError?.(errorMessage);
    }
  };

  const startScanLoop = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Start scanning loop
    scanIntervalRef.current = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data for QR code detection
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Use the qr-scanner library for detection
        detectQRCode(imageData);
      }
    }, 100); // Scan every 100ms
  };

  const detectQRCode = async (imageData: ImageData) => {
    try {
      // Import QrScanner dynamically to avoid SSR issues
      const QrScanner = (await import('qr-scanner')).default;
      
      // Convert ImageData to canvas for QR scanner
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // QrScanner can work directly with the canvas element
      const result = await QrScanner.scanImage(canvas, { returnDetailedScanResult: true });
      
      if (result && result.data) {
        console.log('QR Code detected:', result.data);
        onScan(result.data);
        stopScanning();
      }
    } catch (err) {
      // Ignore scan errors (QR code not found in frame)
      // This is normal and happens frequently
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    setError('');

    // Stop scan loop
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    // Stop video stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  if (hasPermission === false) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 border-red-200">
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Camera Access Required</span>
        </div>
        <p className="text-red-600 text-sm mb-3">
          {error || 'Camera access is required to scan QR codes. Please enable camera permissions in your browser.'}
        </p>
        <Button onClick={checkCameraPermission} variant="outline" size="sm">
          <Camera className="h-4 w-4 mr-2" />
          Check Permissions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isScanning ? (
        <div className="text-center p-4 border rounded-lg bg-blue-50 border-blue-200">
          <Camera className="h-12 w-12 mx-auto mb-3 text-blue-600" />
          <p className="text-blue-800 mb-3">
            Position the QR code within the camera view to scan.
          </p>
          <Button onClick={startScanning} className="w-full">
            <Camera className="h-4 w-4 mr-2" />
            Start Camera
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              playsInline
              muted
            />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-4 border-2 border-green-500 rounded-lg">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400"></div>
              </div>
              
              {/* Instructions */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                  Position QR code within the frame
                </p>
              </div>
            </div>
          </div>

          <Button onClick={stopScanning} variant="outline" className="w-full">
            <X className="h-4 w-4 mr-2" />
            Stop Camera
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Hidden canvas for image processing */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  );
}
