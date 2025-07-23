'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function CartButton() {
  const { itemCount, toggleCart } = useCart();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleCart}
      className="relative"
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      Cart
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 h-5 w-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Button>
  );
}

export function CartSidebar() {
  const { isOpen, setCartOpen, items, total, removeItem, updateQuantity, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(price / 100); // Convert from cents to main currency unit
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setCartOpen(false)}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Shopping Cart</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCartOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Cart Items */}
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Your cart is empty</p>
                  <Button onClick={() => setCartOpen(false)}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.inventory}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(total)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <Button 
                        asChild 
                        className="w-full"
                        onClick={() => setCartOpen(false)}
                      >
                        <Link href="/checkout">
                          Proceed to Checkout
                        </Link>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setCartOpen(false)}
                      >
                        Continue Shopping
                      </Button>

                      {items.length > 0 && (
                        <Button
                          variant="ghost"
                          className="w-full text-red-600 hover:text-red-700"
                          onClick={clearCart}
                        >
                          Clear Cart
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function CartSummary() {
  const { items, total } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(price / 100); // Convert from cents to main currency unit
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
