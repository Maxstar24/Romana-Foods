'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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
    }).format(price);
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
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCartOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Your cart is empty</p>
                  <Button onClick={() => setCartOpen(false)}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(total)}
                  </span>
                </div>

                <div className="space-y-2">
                  <Link href="/checkout" onClick={() => setCartOpen(false)}>
                    <Button className="w-full" size="lg">
                      Checkout
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="w-full"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    inventory: number;
    slug: string;
  };
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Product Image */}
          <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No image</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{item.name}</h3>
            <p className="text-primary font-semibold">
              {formatPrice(item.price)}
            </p>

            {/* Quantity Controls */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="h-7 w-7 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-medium min-w-[2rem] text-center">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.inventory}
                  className="h-7 w-7 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
                className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            {item.quantity >= item.inventory && (
              <p className="text-xs text-red-500 mt-1">Max stock reached</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
