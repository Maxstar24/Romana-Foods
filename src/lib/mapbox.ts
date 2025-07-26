// Mapbox integration for accurate location tracking and routing

export interface Coordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface MapboxAddress {
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  properties: {
    accuracy: string;
  };
}

export interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: any;
}

/**
 * Geocode an address using Mapbox Geocoding API
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.warn('Mapbox access token not configured');
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${accessToken}&country=TZ&limit=1`
    );
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [lng, lat] = feature.center;
      
      return {
        lat,
        lng,
        accuracy: parseFloat(feature.properties?.accuracy || '0'),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to get address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.warn('Mapbox access token not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}&types=address`
    );
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }
    
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Calculate route between two points using Mapbox Directions API
 */
export async function calculateRoute(
  from: Coordinates,
  to: Coordinates,
  profile: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<RouteInfo | null> {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.warn('Mapbox access token not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?access_token=${accessToken}&geometries=geojson&overview=full`
    );
    
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      return {
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Route calculation error:', error);
    return null;
  }
}

/**
 * Optimize delivery route for multiple stops using Mapbox Optimization API
 */
export async function optimizeDeliveryRoute(
  depot: Coordinates,
  stops: Array<{ id: string; coordinates: Coordinates }>
): Promise<{ optimizedOrder: string[]; totalDistance: number; totalDuration: number } | null> {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.warn('Mapbox access token not configured');
    return null;
  }

  try {
    // Build coordinates string: depot;stop1;stop2;...;depot
    const coordinates = [
      `${depot.lng},${depot.lat}`,
      ...stops.map(stop => `${stop.coordinates.lng},${stop.coordinates.lat}`),
      `${depot.lng},${depot.lat}`
    ].join(';');

    const response = await fetch(
      `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinates}?access_token=${accessToken}&source=first&destination=last&roundtrip=false`
    );
    
    const data = await response.json();
    
    if (data.trips && data.trips.length > 0) {
      const trip = data.trips[0];
      const optimizedOrder = trip.waypoints
        .slice(1, -1) // Remove depot start and end
        .map((waypoint: any) => stops[waypoint.waypoint_index - 1]?.id)
        .filter((id: string) => id);
      
      return {
        optimizedOrder,
        totalDistance: trip.distance,
        totalDuration: trip.duration,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Route optimization error:', error);
    return null;
  }
}

/**
 * Get current location from browser geolocation API
 */
export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Format coordinates as a readable string
 */
export function formatCoordinates(coords: Coordinates): string {
  return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (from.lat * Math.PI) / 180;
  const φ2 = (to.lat * Math.PI) / 180;
  const Δφ = ((to.lat - from.lat) * Math.PI) / 180;
  const Δλ = ((to.lng - from.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
