import crypto from 'crypto';
import QRCode from 'qrcode';
import { getQRCodeBaseUrl } from '@/lib/config';

// Generate unique order number
export function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RN${timestamp}${random}`;
}

// Generate QR code for order tracking
export async function generateQRCode(orderNumber: string): Promise<string> {
  try {
    // Use the correct base URL for QR codes
    const trackingUrl = `${getQRCodeBaseUrl()}/track/${orderNumber}`;
    const qrCodeDataURL = await QRCode.toDataURL(trackingUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Generate SHA256 hash for receipt verification
export function generateTrackingHash(orderNumber: string, userEmail: string): string {
  const salt = process.env.NEXTAUTH_SECRET || 'default-salt';
  const data = `${orderNumber}-${userEmail}-${salt}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Calculate order total including shipping
export function calculateOrderTotal(subtotal: number, shippingCost?: number): number {
  return subtotal + (shippingCost || 0);
}

// Format price for display
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(price);
}

// Validate inventory before order placement
export function validateInventory(items: Array<{productId: string, quantity: number, inventory: number}>): boolean {
  return items.every(item => item.quantity <= item.inventory);
} 