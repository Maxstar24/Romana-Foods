'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

interface DeliveryStop {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  coordinates: [number, number]; // [latitude, longitude]
  estimatedTime: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
  priority: number;
}

interface DeliveryMapProps {
  stops: DeliveryStop[];
  routeName: string;
}

export default function DeliveryMap({ stops, routeName }: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || stops.length === 0) return;

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      // Center on Dar es Salaam
      mapInstanceRef.current = L.map(mapRef.current).setView([-6.7924, 39.2083], 12);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers and routes
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Create custom icons for different statuses
    const createCustomIcon = (status: string, priority: number) => {
      let color = '#3B82F6'; // blue for pending
      if (status === 'DELIVERED') color = '#10B981'; // green
      if (status === 'IN_TRANSIT') color = '#F59E0B'; // orange

      return L.divIcon({
        html: `
          <div style="
            background-color: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
          ">
            ${priority}
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
    };

    // Add markers for each stop
    const coordinates: L.LatLng[] = [];
    stops.forEach((stop, index) => {
      const [lat, lng] = stop.coordinates;
      const latLng = L.latLng(lat, lng);
      coordinates.push(latLng);

      const marker = L.marker(latLng, {
        icon: createCustomIcon(stop.status, stop.priority),
      }).addTo(map);

      // Add popup with stop information
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1F2937;">
            Stop ${stop.priority}: ${stop.orderNumber}
          </h3>
          <p style="margin: 4px 0; color: #374151;">
            <strong>Customer:</strong> ${stop.customerName}
          </p>
          <p style="margin: 4px 0; color: #374151;">
            <strong>Address:</strong> ${stop.address}
          </p>
          <p style="margin: 4px 0; color: #374151;">
            <strong>Estimated Time:</strong> ${stop.estimatedTime}
          </p>
          <div style="margin-top: 8px;">
            <span style="
              background-color: ${stop.status === 'DELIVERED' ? '#10B981' : stop.status === 'IN_TRANSIT' ? '#F59E0B' : '#3B82F6'};
              color: white;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;
            ">
              ${stop.status}
            </span>
          </div>
        </div>
      `);
    });

    // Draw route line connecting all stops
    if (coordinates.length > 1) {
      const polyline = L.polyline(coordinates, {
        color: '#3B82F6',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 5',
      }).addTo(map);

      // Fit map to show all markers
      const group = new L.FeatureGroup([polyline]);
      map.fitBounds(group.getBounds().pad(0.1));
    } else if (coordinates.length === 1) {
      // If only one stop, center on it
      map.setView(coordinates[0], 15);
    }

    // Add route info control
    const RouteInfoControl = L.Control.extend({
      onAdd: function() {
        const div = L.DomUtil.create('div', 'route-info');
        div.innerHTML = `
          <div style="
            background: white;
            padding: 12px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border: 1px solid #E5E7EB;
          ">
            <h4 style="margin: 0 0 8px 0; font-weight: bold; color: #1F2937;">
              ${routeName}
            </h4>
            <p style="margin: 2px 0; color: #374151; font-size: 14px;">
              📍 ${stops.length} stops
            </p>
            <p style="margin: 2px 0; color: #374151; font-size: 14px;">
              ✅ ${stops.filter(s => s.status === 'DELIVERED').length} delivered
            </p>
          </div>
        `;
        return div;
      }
    });

    const routeInfo = new RouteInfoControl({ position: 'topright' });
    routeInfo.addTo(map);

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [stops, routeName]);

  return (
    <div
      ref={mapRef}
      className="h-96 w-full rounded-lg border border-gray-200"
      style={{ zIndex: 1 }}
    />
  );
}
