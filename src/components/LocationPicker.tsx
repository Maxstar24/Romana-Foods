'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Target } from 'lucide-react';
import { Coordinates, getCurrentLocation, geocodeAddress, reverseGeocode } from '@/lib/mapbox';

interface LocationPickerProps {
  onLocationSelect: (location: { coordinates: Coordinates; address: string }) => void;
  initialAddress?: string;
  initialCoordinates?: Coordinates;
}

export function LocationPicker({ onLocationSelect, initialAddress, initialCoordinates }: LocationPickerProps) {
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(initialCoordinates || null);
  const [address, setAddress] = useState(initialAddress || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Mapbox map
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      setError('Mapbox access token not configured');
      return;
    }

    // Load Mapbox GL JS dynamically
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      // Initialize map
      const mapboxgl = (window as any).mapboxgl;
      mapboxgl.accessToken = accessToken;

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: initialCoordinates ? [initialCoordinates.lng, initialCoordinates.lat] : [39.2083, -6.7924], // Dar es Salaam
        zoom: initialCoordinates ? 15 : 10,
      });

      // Add click handler
      mapInstance.on('click', async (e: any) => {
        const coords = {
          lat: e.lngLat.lat,
          lng: e.lngLat.lng,
        };
        
        setCoordinates(coords);
        updateMarker(mapInstance, coords);
        
        // Reverse geocode to get address
        setLoading(true);
        try {
          const addressResult = await reverseGeocode(coords.lat, coords.lng);
          if (addressResult) {
            setAddress(addressResult);
            onLocationSelect({ coordinates: coords, address: addressResult });
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
        }
        setLoading(false);
      });

      setMap(mapInstance);

      // Set initial marker if coordinates provided
      if (initialCoordinates) {
        updateMarker(mapInstance, initialCoordinates);
      }
    };
    document.head.appendChild(script);

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  const updateMarker = (mapInstance: any, coords: Coordinates) => {
    const mapboxgl = (window as any).mapboxgl;
    
    if (marker) {
      marker.remove();
    }

    const newMarker = new mapboxgl.Marker({
      color: '#ef4444',
      draggable: true,
    })
      .setLngLat([coords.lng, coords.lat])
      .addTo(mapInstance);

    // Handle marker drag
    newMarker.on('dragend', async () => {
      const lngLat = newMarker.getLngLat();
      const newCoords = {
        lat: lngLat.lat,
        lng: lngLat.lng,
      };
      
      setCoordinates(newCoords);
      
      // Reverse geocode new position
      setLoading(true);
      try {
        const addressResult = await reverseGeocode(newCoords.lat, newCoords.lng);
        if (addressResult) {
          setAddress(addressResult);
          onLocationSelect({ coordinates: newCoords, address: addressResult });
        }
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
      }
      setLoading(false);
    });

    setMarker(newMarker);
  };

  const handleGeocodeAddress = async () => {
    if (!address.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const coords = await geocodeAddress(address);
      if (coords && map) {
        setCoordinates(coords);
        map.flyTo({ center: [coords.lng, coords.lat], zoom: 15 });
        updateMarker(map, coords);
        onLocationSelect({ coordinates: coords, address });
      } else {
        setError('Address not found');
      }
    } catch (error) {
      setError('Failed to geocode address');
    }
    
    setLoading(false);
  };

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const coords = await getCurrentLocation();
      setCoordinates(coords);
      
      if (map) {
        map.flyTo({ center: [coords.lng, coords.lat], zoom: 15 });
        updateMarker(map, coords);
      }
      
      // Reverse geocode to get address
      const addressResult = await reverseGeocode(coords.lat, coords.lng);
      if (addressResult) {
        setAddress(addressResult);
        onLocationSelect({ coordinates: coords, address: addressResult });
      }
    } catch (error) {
      setError('Failed to get current location');
    }
    
    setLoading(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Select Delivery Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address to search..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleGeocodeAddress()}
          />
          <Button onClick={handleGeocodeAddress} disabled={loading}>
            <MapPin className="h-4 w-4" />
          </Button>
          <Button onClick={handleGetCurrentLocation} disabled={loading} variant="outline">
            <Navigation className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {/* Map Container */}
        <div className="relative">
          <div 
            ref={mapContainer} 
            className="w-full h-64 rounded-md border border-gray-300"
          />
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-md">
              <div className="text-sm text-gray-600">Loading...</div>
            </div>
          )}
        </div>

        {/* Coordinates Display */}
        {coordinates && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <Target className="h-4 w-4" />
            <span>
              Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              {coordinates.accuracy && ` (±${coordinates.accuracy.toFixed(0)}m)`}
            </span>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Click on the map to select a location, or drag the marker to adjust the position.
        </div>
      </CardContent>
    </Card>
  );
}
