/**
 * Environment Configuration Helper for Romana Foods
 * Provides correct URLs for different environments
 * Production domains: romana-natural-products.org & romana-foods-tanzania-af236a8fb776.herokuapp.com
 */

export const config = {
  // Get the correct base URL for the application
  getBaseUrl: (): string => {
    // In production, use SITE_URL if available, otherwise fall back to NEXTAUTH_URL
    if (process.env.NODE_ENV === 'production') {
      return process.env.SITE_URL || process.env.NEXTAUTH_URL || 'https://romana-natural-products.org';
    }
    
    // In development, prefer localhost
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
  },

  // Get URL for QR codes (should always point to production site)
  getQRCodeBaseUrl: (): string => {
    return process.env.SITE_URL || process.env.NEXTAUTH_URL || 'https://romana-natural-products.org';
  },

  // Get URL for authentication (NextAuth)
  getAuthUrl: (): string => {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
  },

  // Check if we're in production
  isProduction: (): boolean => {
    return process.env.NODE_ENV === 'production';
  },

  // Check if we're in development
  isDevelopment: (): boolean => {
    return process.env.NODE_ENV !== 'production';
  }
};

// Export individual functions for convenience
export const getBaseUrl = config.getBaseUrl;
export const getQRCodeBaseUrl = config.getQRCodeBaseUrl;
export const getAuthUrl = config.getAuthUrl;
export const isProduction = config.isProduction;
export const isDevelopment = config.isDevelopment;
