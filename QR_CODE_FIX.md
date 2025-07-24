# 🚀 Romana Foods Deployment Guide - QR Code Fix

## 📋 Quick Fix for QR Code Issue

The QR codes were pointing to `localhost:3000` because the environment variables weren't configured for production. Here's how to fix it:

### 🔧 For Immediate Testing (Local Development)

1. **Your `.env` file is now configured with:**
```bash
SITE_URL="https://romana-natural-products.org"
```

2. **Your production domains:**
   - **Primary**: `https://romana-natural-products.org`
   - **Heroku**: `https://romana-foods-tanzania-af236a8fb776.herokuapp.com`

### 🌐 For Production Deployment

#### Configuration for Your Domains

**Custom Domain (Primary):**
```bash
SITE_URL="https://romana-natural-products.org"
NEXTAUTH_URL="https://romana-natural-products.org"
NEXTAUTH_SECRET="generate-a-secure-secret"
NODE_ENV="production"
```

**Heroku App (Alternative):**
```bash
SITE_URL="https://romana-foods-tanzania-af236a8fb776.herokuapp.com"
NEXTAUTH_URL="https://romana-foods-tanzania-af236a8fb776.herokuapp.com"
NEXTAUTH_SECRET="generate-a-secure-secret"
NODE_ENV="production"
```

### 🔄 How It Works Now

1. **QR Code Generation**: Uses `SITE_URL` for the tracking links
2. **Fallback Logic**: If `SITE_URL` isn't set, falls back to `NEXTAUTH_URL`
3. **Environment Aware**: Automatically adapts to development vs production

### 🧪 Testing the Fix

1. **Update your environment variables**
2. **Restart your development server:**
```bash
npm run dev
```
3. **Create a test order**
4. **Scan the QR code** - it should now point to your correct domain

### 📱 QR Code URLs Will Now Generate As:
- **Before**: `http://localhost:3000/track/RN123456`
- **After**: `https://romana-natural-products.org/track/RN123456`

### 🔧 Quick Commands

**Generate a secure secret for production:**
```bash
openssl rand -base64 32
```

**Test QR code generation:**
```bash
# The QR codes will now use your SITE_URL
curl http://localhost:3000/api/orders
```

### 📝 Environment Priority

The system now follows this priority for QR codes:
1. `SITE_URL` (your production domain)
2. `NEXTAUTH_URL` (fallback)
3. `http://localhost:3000` (final fallback)

---

**🎉 Once you update `SITE_URL` to your actual domain, all new QR codes will point to the correct website!**
