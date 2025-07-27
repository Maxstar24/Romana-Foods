'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Route,
  Truck
} from 'lucide-react';
import Link from 'next/link';

interface DeliveryStats {
  todayDeliveries: number;
  completedToday: number;
  pendingDeliveries: number;
  totalDistance: number;
}

interface TodayDelivery {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  status: string;
  estimatedDelivery: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
  }>;
}

export default function DeliveryDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DeliveryStats>({
    todayDeliveries: 0,
    completedToday: 0,
    pendingDeliveries: 0,
    totalDistance: 0,
  });
  const [todayDeliveries, setTodayDeliveries] = useState<TodayDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/delivery/dashboard');
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setTodayDeliveries(data.todayDeliveries);
      } else {
        console.error('Failed to fetch dashboard data');
        // Fallback to empty state
        setStats({
          todayDeliveries: 0,
          completedToday: 0,
          pendingDeliveries: 0,
          totalDistance: 0,
        });
        setTodayDeliveries([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to empty state
      setStats({
        todayDeliveries: 0,
        completedToday: 0,
        pendingDeliveries: 0,
        totalDistance: 0,
      });
      setTodayDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Good morning, {session?.user.name}!</h2>
        <p className="text-blue-100">You have {stats.pendingDeliveries} deliveries scheduled for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Deliveries</p>
                <p className="text-3xl font-bold text-gray-900">{stats.todayDeliveries}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingDeliveries}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Distance (km)</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalDistance}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Available Orders</h3>
            <p className="text-gray-600 mb-4">Claim new orders ready for delivery</p>
            <Link href="/delivery/available">
              <Button className="w-full bg-orange-600 hover:bg-orange-700">Claim Orders</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Route className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">View Today's Route</h3>
            <p className="text-gray-600 mb-4">See optimized delivery route with GPS navigation</p>
            <Link href="/delivery/routes">
              <Button className="w-full">Open Route</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Truck className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start Delivery</h3>
            <p className="text-gray-600 mb-4">Begin your delivery route for today</p>
            <Link href="/delivery/active">
              <Button className="w-full" variant="outline">Start Now</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Offline Mode</h3>
            <p className="text-gray-600 mb-4">Download routes for offline delivery</p>
            <Button className="w-full" variant="outline">Download Maps</Button>
          </CardContent>
        </Card>
      </div>

      {/* Today's Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayDeliveries.map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{delivery.orderNumber}</p>
                      <p className="text-sm text-gray-600">{delivery.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {delivery.address}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{delivery.estimatedDelivery}</p>
                    <Badge className={getStatusColor(delivery.status)}>
                      {delivery.status}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
