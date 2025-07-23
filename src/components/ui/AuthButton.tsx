'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings, ShoppingBag, Package, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center space-x-3">
        <Link href="/auth/signin">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            Sign In
          </Button>
        </Link>
        <Link href="/auth/signup">
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  const handleSignOut = async () => {
    const confirmed = confirm('Are you sure you want to sign out?');
    if (confirmed) {
      await signOut({ callbackUrl: '/store' });
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Menu Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
          <User className="h-4 w-4" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {session.user?.name || session.user?.email}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {session.user?.role?.toLowerCase()}
          </p>
        </div>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {session.user?.name || session.user?.email}
            </p>
            <p className="text-xs text-gray-500">
              {session.user?.email}
            </p>
          </div>

          <Link
            href="/store"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setShowDropdown(false)}
          >
            <ShoppingBag className="h-4 w-4 mr-3" />
            Store
          </Link>

          <Link
            href="/orders"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setShowDropdown(false)}
          >
            <Package className="h-4 w-4 mr-3" />
            My Orders
          </Link>

          <Link
            href="/track"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setShowDropdown(false)}
          >
            <Search className="h-4 w-4 mr-3" />
            Track Order
          </Link>

          {session.user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              <Settings className="h-4 w-4 mr-3" />
              Admin Panel
            </Link>
          )}

          <div className="border-t border-gray-100 mt-1">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 