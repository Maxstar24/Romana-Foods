'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Plus, 
  MapPin, 
  Edit, 
  Trash2, 
  Loader2,
  Map,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

interface DeliverySubregion {
  id: string;
  name: string;
  code?: string;
  description?: string;
  deliveryFee: number;
  isActive: boolean;
  sortOrder: number;
}

interface DeliveryRegion {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  subregions: DeliverySubregion[];
}

export default function DeliveryRegionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [regions, setRegions] = useState<DeliveryRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewRegionForm, setShowNewRegionForm] = useState(false);
  const [showNewSubregionForm, setShowNewSubregionForm] = useState<string | null>(null);
  
  // Form states
  const [newRegion, setNewRegion] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
    sortOrder: 0
  });
  
  const [newSubregion, setNewSubregion] = useState({
    name: '',
    code: '',
    description: '',
    deliveryFee: '',
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else {
      fetchRegions();
    }
  }, [session, status, router]);

  const fetchRegions = async () => {
    try {
      const response = await fetch('/api/admin/delivery-regions');
      if (response.ok) {
        const data = await response.json();
        setRegions(data.regions);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/admin/delivery-regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRegion),
      });

      if (response.ok) {
        await fetchRegions();
        setNewRegion({
          name: '',
          code: '',
          description: '',
          isActive: true,
          sortOrder: 0
        });
        setShowNewRegionForm(false);
      }
    } catch (error) {
      console.error('Error creating region:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSubregion = async (e: React.FormEvent, regionId: string) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/delivery-regions/${regionId}/subregions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubregion),
      });

      if (response.ok) {
        await fetchRegions();
        setNewSubregion({
          name: '',
          code: '',
          description: '',
          deliveryFee: '',
          isActive: true,
          sortOrder: 0
        });
        setShowNewSubregionForm(null);
      }
    } catch (error) {
      console.error('Error creating subregion:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Delivery Regions</h1>
                <p className="text-gray-600 mt-1">Manage delivery areas and pricing</p>
              </div>
            </div>
            <Button onClick={() => setShowNewRegionForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Region
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Region Form */}
        {showNewRegionForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Region</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRegion} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="region-name">Region Name *</Label>
                    <Input
                      id="region-name"
                      value={newRegion.name}
                      onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })}
                      placeholder="e.g., Dar es Salaam"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="region-code">Region Code</Label>
                    <Input
                      id="region-code"
                      value={newRegion.code}
                      onChange={(e) => setNewRegion({ ...newRegion, code: e.target.value })}
                      placeholder="e.g., DSM"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="region-description">Description</Label>
                  <Textarea
                    id="region-description"
                    value={newRegion.description}
                    onChange={(e) => setNewRegion({ ...newRegion, description: e.target.value })}
                    placeholder="Optional description for this region"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewRegionForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Region'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Regions List */}
        <div className="space-y-6">
          {regions.map((region) => (
            <Card key={region.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Map className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{region.name}</span>
                        {region.code && (
                          <Badge variant="secondary">{region.code}</Badge>
                        )}
                      </CardTitle>
                      {region.description && (
                        <p className="text-sm text-gray-600 mt-1">{region.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={region.isActive ? "default" : "secondary"}>
                      {region.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewSubregionForm(region.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subregion
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* New Subregion Form */}
                {showNewSubregionForm === region.id && (
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium mb-4">Add New Subregion</h4>
                    <form onSubmit={(e) => handleCreateSubregion(e, region.id)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="subregion-name">Subregion Name *</Label>
                          <Input
                            id="subregion-name"
                            value={newSubregion.name}
                            onChange={(e) => setNewSubregion({ ...newSubregion, name: e.target.value })}
                            placeholder="e.g., Kinondoni"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="subregion-code">Code</Label>
                          <Input
                            id="subregion-code"
                            value={newSubregion.code}
                            onChange={(e) => setNewSubregion({ ...newSubregion, code: e.target.value })}
                            placeholder="e.g., KIN"
                          />
                        </div>
                        <div>
                          <Label htmlFor="delivery-fee">Delivery Fee (TZS) *</Label>
                          <Input
                            id="delivery-fee"
                            type="number"
                            value={newSubregion.deliveryFee}
                            onChange={(e) => setNewSubregion({ ...newSubregion, deliveryFee: e.target.value })}
                            placeholder="e.g., 3000"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="subregion-description">Description</Label>
                        <Textarea
                          id="subregion-description"
                          value={newSubregion.description}
                          onChange={(e) => setNewSubregion({ ...newSubregion, description: e.target.value })}
                          placeholder="Optional description"
                        />
                      </div>
                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowNewSubregionForm(null)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Creating...
                            </>
                          ) : (
                            'Create Subregion'
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Subregions List */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700 uppercase tracking-wide">
                    Delivery Areas ({region.subregions.length})
                  </h4>
                  {region.subregions.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">
                      No delivery areas added yet. Add your first subregion to start setting up delivery pricing.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {region.subregions.map((subregion) => (
                        <div
                          key={subregion.id}
                          className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{subregion.name}</span>
                              {subregion.code && (
                                <Badge variant="outline" className="text-xs">
                                  {subregion.code}
                                </Badge>
                              )}
                            </div>
                            <Badge variant={subregion.isActive ? "default" : "secondary"} className="text-xs">
                              {subregion.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-1 mb-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-600">
                              {formatPrice(Number(subregion.deliveryFee))}
                            </span>
                          </div>
                          
                          {subregion.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {subregion.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {regions.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No delivery regions yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by adding your first delivery region to set up delivery areas and pricing.
                </p>
                <Button onClick={() => setShowNewRegionForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Region
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
