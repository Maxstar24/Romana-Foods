'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Search, Edit, Trash2, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  inventory: number;
  images: string[];
  isFeatured: boolean;
  category: {
    name: string;
  };
}

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [quickUpdateProduct, setQuickUpdateProduct] = useState<Product | null>(null);
  const [newInventory, setNewInventory] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else {
      fetchProducts();
    }
  }, [session, status, router]);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?admin=true');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const updateInventory = async () => {
    if (!quickUpdateProduct || !newInventory) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/products/${quickUpdateProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...quickUpdateProduct,
          inventory: parseInt(newInventory),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(products.map(p => 
          p.id === quickUpdateProduct.id 
            ? { ...p, inventory: parseInt(newInventory) }
            : p
        ));
        setQuickUpdateProduct(null);
        setNewInventory('');
      } else {
        alert('Failed to update inventory');
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Failed to update inventory');
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(price / 100); // Convert from cents to main currency unit
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            </div>
            <Link href="/admin/products/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No products match your search.' : 'Get started by adding your first product.'}
              </p>
              <Link href="/admin/products/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square bg-gray-100 relative">
                  {product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  {product.isFeatured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      Featured
                    </Badge>
                  )}
                  {product.inventory <= 5 && (
                    <Badge className="absolute top-2 right-2 bg-red-500">
                      Low Stock
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category.name}</p>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(product.price)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Stock:</span>
                        <span className={`text-sm font-medium ${product.inventory <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                          {product.inventory}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setQuickUpdateProduct(product)}
                          className="p-1 h-6 w-6"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Inventory Update Modal */}
      {quickUpdateProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Update Inventory</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="product-name">Product</Label>
                <Input
                  id="product-name"
                  value={quickUpdateProduct.name}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="current-inventory">Current Stock</Label>
                <Input
                  id="current-inventory"
                  value={quickUpdateProduct.inventory}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="new-inventory">New Stock *</Label>
                <Input
                  id="new-inventory"
                  type="number"
                  value={newInventory}
                  onChange={(e) => setNewInventory(e.target.value)}
                  placeholder="Enter new stock quantity"
                  min="0"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setQuickUpdateProduct(null);
                  setNewInventory('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={updateInventory}
                disabled={updating || !newInventory}
                className="flex-1"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Stock'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
