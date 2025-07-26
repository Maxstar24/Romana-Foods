'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle,
  Search,
  Filter,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface DeliveryHistoryItem {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  deliveredAt: string;
  total: number;
  status: 'DELIVERED' | 'FAILED';
  notes?: string;
  signature: boolean;
}

interface DeliveryStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  averageTime: string;
  totalEarnings: number;
}

export default function DeliveryHistoryPage() {
  const { data: session } = useSession();
  const [deliveries, setDeliveries] = useState<DeliveryHistoryItem[]>([]);
  const [stats, setStats] = useState<DeliveryStats>({
    totalDeliveries: 0,
    successfulDeliveries: 0,
    averageTime: '0h 0m',
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchDeliveryHistory();
  }, []);

  const fetchDeliveryHistory = async () => {
    try {
      // TODO: Replace with actual API call
      // For now, using mock data
      const mockDeliveries: DeliveryHistoryItem[] = [
        {
          id: '1',
          orderNumber: 'RN1753536465158957',
          customerName: 'John Doe',
          address: 'Msasani, Kinondoni, Dar es Salaam',
          deliveredAt: '2025-01-26T09:30:00Z',
          total: 45000,
          status: 'DELIVERED',
          notes: 'Customer satisfied',
          signature: true,
        },
        {
          id: '2',
          orderNumber: 'RN1753536465158958',
          customerName: 'Jane Smith',
          address: 'Mikocheni, Kinondoni, Dar es Salaam',
          deliveredAt: '2025-01-26T10:15:00Z',
          total: 32000,
          status: 'DELIVERED',
          signature: true,
        },
        {
          id: '3',
          orderNumber: 'RN1753536465158959',
          customerName: 'Mike Johnson',
          address: 'Sinza, Kinondoni, Dar es Salaam',
          deliveredAt: '2025-01-25T14:30:00Z',
          total: 67000,
          status: 'DELIVERED',
          notes: 'Left with security guard',
          signature: true,
        },
        {
          id: '4',
          orderNumber: 'RN1753536465158960',
          customerName: 'Sarah Wilson',
          address: 'Kariakoo, Ilala, Dar es Salaam',
          deliveredAt: '2025-01-25T16:45:00Z',
          total: 28000,
          status: 'DELIVERED',
          signature: true,
        },
      ];

      setDeliveries(mockDeliveries);
      
      // Calculate stats
      const totalDeliveries = mockDeliveries.length;
      const successfulDeliveries = mockDeliveries.filter(d => d.status === 'DELIVERED').length;
      const totalEarnings = mockDeliveries.reduce((sum, d) => sum + d.total, 0);
      
      setStats({
        totalDeliveries,
        successfulDeliveries,
        averageTime: '2h 15m',
        totalEarnings,
      });
    } catch (error) {
      console.error('Error fetching delivery history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (dateFilter === 'today') {
      const today = new Date().toDateString();
      const deliveryDate = new Date(delivery.deliveredAt).toDateString();
      return matchesSearch && deliveryDate === today;
    }
    
    if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return matchesSearch && new Date(delivery.deliveredAt) >= weekAgo;
    }
    
    return matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-TZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'DELIVERED' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
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
        <h1 className="text-2xl font-bold text-gray-900">Delivery History</h1>
        <div className="text-sm text-gray-500">
          Welcome back, {session?.user.name}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDeliveries}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-green-600">
                  {Math.round((stats.successfulDeliveries / stats.totalDeliveries) * 100)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                <p className="text-3xl font-bold text-purple-600">{stats.averageTime}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.totalEarnings)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by order number or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={dateFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setDateFilter('all')}
                size="sm"
              >
                All Time
              </Button>
              <Button
                variant={dateFilter === 'week' ? 'default' : 'outline'}
                onClick={() => setDateFilter('week')}
                size="sm"
              >
                This Week
              </Button>
              <Button
                variant={dateFilter === 'today' ? 'default' : 'outline'}
                onClick={() => setDateFilter('today')}
                size="sm"
              >
                Today
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery History List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries ({filteredDeliveries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <div key={delivery.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{delivery.orderNumber}</p>
                        <p className="text-sm text-gray-600">{delivery.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {delivery.address}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(delivery.deliveredAt)}
                      </div>
                    </div>
                    {delivery.notes && (
                      <p className="text-sm text-gray-500 mt-2">📝 {delivery.notes}</p>
                    )}
                  </div>
                  
                  <div className="text-right space-y-2">
                    <p className="font-medium">{formatCurrency(delivery.total)}</p>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(delivery.status)}>
                        {delivery.status}
                      </Badge>
                      {delivery.signature && (
                        <Badge variant="outline" className="text-xs">
                          ✓ Signed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredDeliveries.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No deliveries found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
