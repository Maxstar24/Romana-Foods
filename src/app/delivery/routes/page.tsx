'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Map, 
  Navigation, 
  Download, 
  Play, 
  MapPin, 
  Clock,
  Route,
  Package
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const DeliveryMap = dynamic(() => import('@/components/DeliveryMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Map className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

interface DeliveryStop {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  coordinates: [number, number]; // [latitude, longitude]
  estimatedTime: string;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED';
  priority: number;
}

interface DeliveryRoute {
  id: string;
  name: string;
  totalStops: number;
  estimatedDuration: string;
  totalDistance: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  stops: DeliveryStop[];
}

export default function DeliveryRoutes() {
  const [selectedRoute, setSelectedRoute] = useState<DeliveryRoute | null>(null);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/delivery/routes');
      
      if (response.ok) {
        const data = await response.json();
        setRoutes(data.routes || []);
        if (data.routes && data.routes.length > 0) {
          setSelectedRoute(data.routes[0]);
        }
      } else {
        console.error('Failed to fetch routes data');
        setRoutes([]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStopStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartRoute = (routeId: string) => {
    // TODO: Implement route start logic
    console.log('Starting route:', routeId);
  };

  const handleDownloadMaps = () => {
    // TODO: Implement offline map download
    console.log('Downloading maps for offline use');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Routes</h1>
        <div className="flex space-x-3">
          <Button onClick={handleDownloadMaps} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Maps
          </Button>
          {selectedRoute && (
            <Button onClick={() => handleStartRoute(selectedRoute.id)}>
              <Play className="h-4 w-4 mr-2" />
              Start Route
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Routes List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Today's Routes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRoute?.id === route.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{route.name}</h3>
                    <Badge className={getStatusColor(route.status)}>
                      {route.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-1" />
                      {route.totalStops} stops
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {route.estimatedDuration}
                    </div>
                    <div className="flex items-center">
                      <Route className="h-4 w-4 mr-1" />
                      {route.totalDistance}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Route Details */}
          {selectedRoute && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Route Stops</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedRoute.stops.map((stop, index) => (
                    <div key={stop.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{stop.orderNumber}</p>
                        <p className="text-sm text-gray-600">{stop.customerName}</p>
                        <p className="text-xs text-gray-500 truncate">{stop.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{stop.estimatedTime}</p>
                        <Badge className={`${getStopStatusColor(stop.status)} text-xs`}>
                          {stop.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map className="h-5 w-5 mr-2" />
                Route Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRoute ? (
                <DeliveryMap
                  stops={selectedRoute.stops}
                  routeName={selectedRoute.name}
                />
              ) : (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Map className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Select a route to view map</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
