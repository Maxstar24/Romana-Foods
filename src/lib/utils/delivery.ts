import crypto from 'crypto';

/**
 * Hash a signature using SHA256 for privacy and storage
 * @param signatureData - The signature data (could be base64 string or raw data)
 * @returns SHA256 hash of the signature
 */
export function hashSignature(signatureData: string): string {
  return crypto.createHash('sha256').update(signatureData).digest('hex');
}

/**
 * Verify a signature against its hash
 * @param signatureData - The original signature data
 * @param hash - The stored hash to verify against
 * @returns boolean indicating if signature matches the hash
 */
export function verifySignature(signatureData: string, hash: string): boolean {
  const computedHash = hashSignature(signatureData);
  return computedHash === hash;
}

/**
 * Generate a delivery confirmation token
 * @param orderNumber - The order number
 * @param deliveryPersonId - ID of the delivery person
 * @param timestamp - Delivery timestamp
 * @returns Unique confirmation token
 */
export function generateDeliveryToken(
  orderNumber: string,
  deliveryPersonId: string,
  timestamp: Date = new Date()
): string {
  const data = `${orderNumber}-${deliveryPersonId}-${timestamp.getTime()}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Generate GPS location hash for privacy
 * @param lat - Latitude
 * @param lng - Longitude
 * @param precision - Number of decimal places to maintain (default: 4 for ~11m accuracy)
 * @returns Hashed GPS location
 */
export function hashGPSLocation(lat: number, lng: number, precision: number = 4): string {
  const roundedLat = lat.toFixed(precision);
  const roundedLng = lng.toFixed(precision);
  const locationData = `${roundedLat},${roundedLng}`;
  return crypto.createHash('sha256').update(locationData).digest('hex');
}

/**
 * Create offline delivery log entry
 * @param orderNumber - Order number
 * @param actionType - Type of action performed
 * @param actionData - Data associated with the action
 * @param deviceTimestamp - When the action was performed on device
 * @returns Offline log entry object
 */
export function createOfflineDeliveryLog(
  orderNumber: string,
  actionType: 'START_DELIVERY' | 'COMPLETE_DELIVERY' | 'ADD_SIGNATURE' | 'ADD_NOTE',
  actionData: any,
  deviceTimestamp: Date = new Date()
) {
  return {
    orderNumber,
    actionType,
    actionData: JSON.stringify(actionData),
    deviceTimestamp,
    id: crypto.randomUUID(),
  };
}
