/**
 * Secure Logging Utility for In-House Software
 * Provides safe logging mechanisms that avoid exposing sensitive data
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  metadata?: Record<string, any>;
  sessionId?: string;
  userId?: string;
}

class SecureLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel = process.env.LOG_LEVEL || 'INFO';

  /**
   * Sanitizes sensitive data before logging
   */
  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'auth', 'credential',
      'resetToken', 'accessToken', 'refreshToken', 'apiKey'
    ];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Also check nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Creates a structured log entry
   */
  private createLogEntry(
    level: LogLevel,
    component: string,
    message: string,
    metadata?: Record<string, any>,
    userId?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      metadata: metadata ? this.sanitizeData(metadata) : undefined,
      userId,
      sessionId: this.generateSessionId()
    };
  }

  /**
   * Generates a safe session identifier
   */
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Safe logging for password reset events
   */
  logPasswordResetRequest(email: string, userId?: string): void {
    const logEntry = this.createLogEntry(
      LogLevel.INFO,
      'AUTH',
      'Password reset requested',
      {
        emailDomain: email.split('@')[1], // Log domain, not full email
        timestamp: new Date().toISOString(),
        userExists: !!userId
      },
      userId
    );

    if (this.isDevelopment) {
      console.log('🔐 Password Reset Request:', {
        emailDomain: logEntry.metadata?.emailDomain,
        timestamp: logEntry.timestamp,
        userExists: logEntry.metadata?.userExists
      });
    }

    // In production, send to secure logging service
    this.writeToSecureLog(logEntry);
  }

  /**
   * Safe logging for password reset completion
   */
  logPasswordResetComplete(userId: string, success: boolean): void {
    const logEntry = this.createLogEntry(
      success ? LogLevel.INFO : LogLevel.WARN,
      'AUTH',
      success ? 'Password reset completed' : 'Password reset failed',
      {
        success,
        timestamp: new Date().toISOString()
      },
      userId
    );

    if (this.isDevelopment) {
      console.log(success ? '✅ Password Reset Success' : '❌ Password Reset Failed:', {
        userId: userId.substring(0, 8) + '...', // Partial ID only
        timestamp: logEntry.timestamp,
        success
      });
    }

    this.writeToSecureLog(logEntry);
  }

  /**
   * Safe logging for authentication events
   */
  logAuthEvent(
    event: 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'SESSION_EXPIRED',
    userId?: string,
    metadata?: Record<string, any>
  ): void {
    const logEntry = this.createLogEntry(
      LogLevel.INFO,
      'AUTH',
      `User ${event.toLowerCase()}`,
      {
        event,
        timestamp: new Date().toISOString(),
        ...metadata
      },
      userId
    );

    if (this.isDevelopment) {
      console.log(`🔑 Auth Event: ${event}`, {
        userId: userId ? userId.substring(0, 8) + '...' : 'anonymous',
        timestamp: logEntry.timestamp
      });
    }

    this.writeToSecureLog(logEntry);
  }

  /**
   * Development-only notification system for password reset
   */
  notifyPasswordResetDev(email: string, resetToken: string): void {
    if (!this.isDevelopment) {
      return; // Never execute in production
    }

    // Safe development notification
    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    const shortToken = resetToken.substring(0, 8) + '...';
    
    console.log('\n🔧 DEV MODE - Password Reset Info:');
    console.log('📧 Email:', maskedEmail);
    console.log('🔑 Token (partial):', shortToken);
    console.log('🔗 Reset URL:', `http://localhost:3000/auth/reset-password?token=${resetToken}`);
    console.log('⏰ Expires in 1 hour');
    console.log('⚠️  This information is only shown in development mode\n');
  }

  /**
   * Error logging with context
   */
  logError(
    component: string,
    error: Error,
    context?: Record<string, any>,
    userId?: string
  ): void {
    const logEntry = this.createLogEntry(
      LogLevel.ERROR,
      component,
      error.message,
      {
        stack: error.stack,
        ...context
      },
      userId
    );

    if (this.isDevelopment) {
      console.error('❌ Error:', {
        component,
        message: error.message,
        context: this.sanitizeData(context),
        timestamp: logEntry.timestamp
      });
    }

    this.writeToSecureLog(logEntry);
  }

  /**
   * Write to secure logging system (implement based on your needs)
   */
  private writeToSecureLog(logEntry: LogEntry): void {
    // In production, this would write to:
    // - Secure file system with proper permissions
    // - Database with encryption at rest
    // - External logging service (e.g., DataDog, CloudWatch)
    // - SIEM system for security monitoring
    
    if (process.env.NODE_ENV === 'production') {
      // Example: Write to secure audit log file
      // fs.appendFileSync('/var/log/secure/romana-foods-audit.log', 
      //   JSON.stringify(logEntry) + '\n', { mode: 0o600 });
      
      // Example: Send to monitoring service
      // await sendToMonitoringService(logEntry);
    }
  }
}

// Export singleton instance
export const secureLogger = new SecureLogger();

// Utility functions for common use cases
export const logAuth = {
  passwordResetRequest: (email: string, userId?: string) => 
    secureLogger.logPasswordResetRequest(email, userId),
  
  passwordResetComplete: (userId: string, success: boolean) => 
    secureLogger.logPasswordResetComplete(userId, success),
  
  authEvent: (event: 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'SESSION_EXPIRED', userId?: string, metadata?: Record<string, any>) => 
    secureLogger.logAuthEvent(event, userId, metadata),
  
  error: (component: string, error: Error, context?: Record<string, any>, userId?: string) => 
    secureLogger.logError(component, error, context, userId),
  
  // Development-only notification
  devNotifyPasswordReset: (email: string, resetToken: string) => 
    secureLogger.notifyPasswordResetDev(email, resetToken)
};
