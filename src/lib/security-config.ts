/**
 * Security Configuration for Romana Foods
 * Centralized security settings for in-house deployment
 */

// Environment-specific security settings
export const securityConfig = {
  // Development settings
  development: {
    // Enable detailed logging for debugging (safe logs only)
    enableDetailedLogging: true,
    // Show password reset links in console (development only)
    showResetLinksInConsole: true,
    // Enable debug information
    enableDebugInfo: true,
    // Log level
    logLevel: 'DEBUG'
  },

  // Production settings for in-house deployment
  production: {
    // Minimal logging for production
    enableDetailedLogging: false,
    // Never show sensitive info in console
    showResetLinksInConsole: false,
    // Disable debug information
    enableDebugInfo: false,
    // Production log level
    logLevel: 'INFO'
  },

  // Security headers and policies
  security: {
    // Password requirements
    password: {
      minLength: 8,
      requireNumbers: true,
      requireSpecialChars: true,
      requireUppercase: true,
      requireLowercase: true
    },

    // Session settings
    session: {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      updateAge: 24 * 60 * 60,   // 24 hours
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production'
    },

    // Rate limiting
    rateLimit: {
      passwordReset: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 3 // 3 attempts per window
      },
      login: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5 // 5 attempts per window
      }
    },

    // CORS settings for in-house deployment
    cors: {
      origin: [
        'http://localhost:3000',
        'https://romana-foods.internal', // Your internal domain
        'https://romana-foods.local'     // Local network access
      ],
      credentials: true
    }
  },

  // Audit and monitoring
  audit: {
    // Log security events
    logSecurityEvents: true,
    // Log failed authentication attempts
    logFailedAuth: true,
    // Log password changes
    logPasswordChanges: true,
    // Retention period for logs (days)
    logRetentionDays: 90
  }
};

// Get current environment config
export const getCurrentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  const envConfig = securityConfig[env as keyof typeof securityConfig];
  return {
    ...envConfig,
    ...securityConfig.security,
    ...securityConfig.audit
  };
};

// Security utilities
export const securityUtils = {
  /**
   * Mask sensitive data for logging
   */
  maskEmail: (email: string): string => {
    const [local, domain] = email.split('@');
    return `${local.slice(0, 2)}***@${domain}`;
  },

  /**
   * Generate safe user identifier for logs
   */
  safeUserId: (userId: string): string => {
    return userId.slice(0, 8) + '...';
  },

  /**
   * Check if current environment allows debug info
   */
  canShowDebugInfo: (): boolean => {
    const env = process.env.NODE_ENV || 'development';
    if (env === 'development') {
      return securityConfig.development.enableDebugInfo;
    }
    return securityConfig.production.enableDebugInfo;
  },

  /**
   * Validate password strength
   */
  validatePassword: (password: string): { valid: boolean; errors: string[] } => {
    const config = getCurrentConfig();
    const errors: string[] = [];

    if (password.length < config.password.minLength) {
      errors.push(`Password must be at least ${config.password.minLength} characters long`);
    }

    if (config.password.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (config.password.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (config.password.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (config.password.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

// Export default configuration
export default getCurrentConfig();
