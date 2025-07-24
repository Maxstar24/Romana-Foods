# Security Guide for Romana Foods In-House Deployment

## Overview
This guide outlines the cybersecurity measures implemented for safe in-house deployment of the Romana Foods platform. All sensitive data logging has been replaced with secure alternatives.

## 🔐 Security Features Implemented

### 1. Secure Logging System
- **No Sensitive Data in Logs**: Passwords, tokens, and credentials are automatically redacted
- **Environment-Aware**: Different logging levels for development vs production
- **Audit Trail**: Comprehensive security event logging without exposing sensitive information
- **Safe Development Mode**: Password reset tokens shown in development only (never in production)

### 2. Authentication Security
- **Token-Based Password Reset**: Cryptographically secure reset tokens
- **Session Management**: Secure session handling with proper expiration
- **Secure Logout**: Complete session cleanup including browser storage
- **Rate Limiting**: Protection against brute force attacks

### 3. Data Protection
- **Input Sanitization**: All user inputs are validated and sanitized
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Token Expiration**: Reset tokens expire after 1 hour
- **One-Time Use**: Reset tokens can only be used once

## 🛡️ Security Configuration

### Environment Variables
Copy `.env.example` and customize for your environment:

```bash
# Development (safe for local testing)
NODE_ENV=development
DEV_SHOW_RESET_TOKENS=true
DEV_ENABLE_CONSOLE_LOGS=true
LOG_LEVEL=DEBUG

# Production (secure for deployment)
NODE_ENV=production
DEV_SHOW_RESET_TOKENS=false
DEV_ENABLE_CONSOLE_LOGS=false
LOG_LEVEL=INFO
SECURE_LOG_PATH=/var/log/secure/romana-foods
```

### Security Levels

#### Development Mode (Safe)
- Password reset links shown in console (no sensitive data exposed)
- Email addresses masked (only domain shown)
- User IDs truncated
- Detailed but safe logging

#### Production Mode (Secure)
- No sensitive data in console
- Audit logs written to secure file system
- Minimal logging footprint
- Security events logged for monitoring

## 🔍 Security Monitoring

### What Gets Logged Safely
- Authentication events (login, logout, registration)
- Password reset requests (email domain only, not full email)
- Security failures and errors
- User session activities

### What's NEVER Logged
- Passwords (plain text or hashed)
- Reset tokens (except in development console)
- Full email addresses
- Session tokens
- API keys or secrets

## 🚀 Deployment Checklist

### Pre-Deployment Security Checks
- [ ] Set `NODE_ENV=production`
- [ ] Set `DEV_SHOW_RESET_TOKENS=false`
- [ ] Set `DEV_ENABLE_CONSOLE_LOGS=false`
- [ ] Configure secure log directory
- [ ] Set up proper file permissions
- [ ] Enable HTTPS
- [ ] Configure firewall rules

### File Permissions (Linux/Unix)
```bash
# Secure log directory
sudo mkdir -p /var/log/secure/romana-foods
sudo chmod 750 /var/log/secure/romana-foods
sudo chown root:romana-foods /var/log/secure/romana-foods

# Application directory
sudo chmod 755 /opt/romana-foods
sudo chown romana-foods:romana-foods /opt/romana-foods
```

### Database Security
```bash
# Secure PostgreSQL configuration
# In postgresql.conf:
ssl = on
log_statement = 'mod'
log_min_duration_statement = 1000

# Create dedicated database user
CREATE USER romana_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE romana_foods TO romana_app;
GRANT USAGE ON SCHEMA public TO romana_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO romana_app;
```

## 🔧 Development Workflow

### Safe Development Testing
1. Use development environment with `NODE_ENV=development`
2. Password reset tokens will appear safely in console
3. All logs automatically sanitize sensitive data
4. Test authentication flows without security risks

### Example Development Output
```
🔧 DEV MODE - Password Reset Info:
📧 Email: jo***@example.com
🔑 Token (partial): a1b2c3d4...
🔗 Reset URL: http://localhost:3000/auth/reset-password?token=full_token_here
⏰ Expires in 1 hour
⚠️  This information is only shown in development mode
```

## 📊 Security Metrics

### Monitoring Recommendations
- Monitor failed authentication attempts
- Track password reset frequency
- Alert on unusual login patterns
- Regular audit log reviews

### Log Rotation
```bash
# /etc/logrotate.d/romana-foods
/var/log/secure/romana-foods/*.log {
    daily
    rotate 90
    compress
    delaycompress
    missingok
    create 640 romana-foods romana-foods
}
```

## 🆘 Incident Response

### Security Event Response
1. **Failed Login Attempts**: Automatic rate limiting active
2. **Password Reset Abuse**: Token expiration and one-time use protection
3. **Session Hijacking**: Secure session management with proper cleanup
4. **Data Breach**: All sensitive data is hashed/encrypted or not logged

### Emergency Procedures
1. Check audit logs: `/var/log/secure/romana-foods/`
2. Review authentication patterns
3. Reset affected user passwords
4. Update security configuration if needed

## 📞 Support

For security questions or concerns:
1. Review this security guide
2. Check audit logs for security events
3. Update security configuration as needed
4. Monitor system for unusual activity

---

**Remember**: This system is designed to be secure by default while providing the debugging capabilities you need for in-house development and deployment.
