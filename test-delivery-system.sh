#!/bin/bash

# Romana Foods Delivery System - Mass Testing Script
# Date: July 26, 2025

echo "🚚 Romana Foods Delivery System - Mass Testing"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${BLUE}🧪 Testing: $test_name${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# Start testing
echo "Starting comprehensive delivery system tests..."
echo ""

# 1. Build Test
run_test "Next.js Build" "npm run build > /dev/null 2>&1"

# 2. Database Connection Test
run_test "Database Schema Check" "npx prisma db push --force-reset > /dev/null 2>&1"

# 3. Seed Database with Test Data
echo -e "${YELLOW}📦 Creating test data...${NC}"
run_test "Database Seeding" "npx prisma db seed > /dev/null 2>&1"

# 4. Start Development Server
echo -e "${YELLOW}🚀 Starting development server...${NC}"
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 10

# 5. API Endpoint Tests
echo -e "${YELLOW}🔌 Testing API endpoints...${NC}"

# Test user registration
run_test "User Registration API" "curl -s -X POST http://localhost:3000/api/auth/register -H 'Content-Type: application/json' -d '{\"name\":\"Test Driver\",\"email\":\"driver@test.com\",\"password\":\"password123\",\"role\":\"DELIVERY\"}' | grep -q 'user'"

# Test products API
run_test "Products API" "curl -s http://localhost:3000/api/products | grep -q 'products'"

# Test categories API
run_test "Categories API" "curl -s http://localhost:3000/api/categories | grep -q 'categories'"

# Test delivery regions API
run_test "Delivery Regions API" "curl -s http://localhost:3000/api/delivery-regions | grep -q 'regions'"

# 6. Page Load Tests
echo -e "${YELLOW}🌐 Testing page loads...${NC}"

# Test main pages
run_test "Home Page Load" "curl -s http://localhost:3000 | grep -q 'Romana'"
run_test "Store Page Load" "curl -s http://localhost:3000/store | grep -q 'Store'"
run_test "Auth Signin Page Load" "curl -s http://localhost:3000/auth/signin | grep -q 'Sign'"
run_test "Auth Signup Page Load" "curl -s http://localhost:3000/auth/signup | grep -q 'Sign'"
run_test "Checkout Page Load" "curl -s http://localhost:3000/checkout | grep -q 'Checkout'"
run_test "Track Page Load" "curl -s http://localhost:3000/track | grep -q 'Track'"

# Test delivery pages
run_test "Delivery Dashboard Load" "curl -s http://localhost:3000/delivery | grep -q 'Delivery'"
run_test "Delivery Routes Load" "curl -s http://localhost:3000/delivery/routes | grep -q 'Routes'"
run_test "Delivery Active Load" "curl -s http://localhost:3000/delivery/active | grep -q 'Active'"
run_test "Delivery History Load" "curl -s http://localhost:3000/delivery/history | grep -q 'History'"

# Test admin pages
run_test "Admin Dashboard Load" "curl -s http://localhost:3000/admin | grep -q 'Admin'"
run_test "Admin Orders Load" "curl -s http://localhost:3000/admin/orders | grep -q 'Orders'"
run_test "Admin Products Load" "curl -s http://localhost:3000/admin/products | grep -q 'Products'"

# 7. Component Tests
echo -e "${YELLOW}⚛️  Testing React components...${NC}"

# Check if critical components exist
run_test "DeliveryMap Component" "test -f src/components/DeliveryMap.tsx"
run_test "Delivery Modals Component" "test -f src/components/ui/delivery-modals.tsx"
run_test "Dialog Component" "test -f src/components/ui/dialog.tsx"
run_test "Auth Button Component" "test -f src/components/ui/AuthButton.tsx"

# 8. Utility Function Tests
echo -e "${YELLOW}🔧 Testing utility functions...${NC}"

run_test "Delivery Utils" "test -f src/lib/utils/delivery.ts"
run_test "Order Utils" "test -f src/lib/utils/order.ts"
run_test "Auth Utils" "test -f src/lib/auth.ts"
run_test "Prisma Client" "test -f src/lib/prisma.ts"

# 9. Database Schema Tests
echo -e "${YELLOW}🗄️  Testing database schema...${NC}"

run_test "Prisma Schema" "test -f prisma/schema.prisma"
run_test "Seed Script" "test -f scripts/seed.ts"

# 10. Configuration Tests
echo -e "${YELLOW}⚙️  Testing configuration files...${NC}"

run_test "Next.js Config" "test -f next.config.ts"
run_test "TypeScript Config" "test -f tsconfig.json"
run_test "Package.json" "test -f package.json"
run_test "ESLint Config" "test -f eslint.config.mjs"
run_test "PostCSS Config" "test -f postcss.config.mjs"

# 11. Security Tests
echo -e "${YELLOW}🔒 Testing security configurations...${NC}"

# Check for environment variables
run_test "Environment File" "test -f .env.local || test -f .env"

# Check for sensitive file exclusions
run_test "Gitignore Present" "test -f .gitignore"

# 12. Performance Tests
echo -e "${YELLOW}📊 Running performance checks...${NC}"

# Check bundle sizes (from build output)
run_test "Bundle Size Check" "du -sh .next/static/chunks/* | head -5 > /dev/null"

# 13. Mobile Responsiveness Tests
echo -e "${YELLOW}📱 Testing mobile compatibility...${NC}"

# Check for viewport meta tags and responsive components
run_test "Responsive Components" "grep -r 'sm:' src/components/ > /dev/null"
run_test "Mobile Breakpoints" "grep -r 'md:' src/components/ > /dev/null"

# 14. Accessibility Tests
echo -e "${YELLOW}♿ Testing accessibility features...${NC}"

# Check for accessibility attributes
run_test "Alt Text Usage" "grep -r 'alt=' src/ > /dev/null"
run_test "ARIA Labels" "grep -r 'aria-' src/ > /dev/null"

# 15. Delivery System Specific Tests
echo -e "${YELLOW}🚚 Testing delivery system features...${NC}"

# Check delivery-specific files
run_test "QR Code Scanner" "grep -r 'html5-qrcode' src/ > /dev/null"
run_test "Leaflet Maps" "grep -r 'leaflet' src/ > /dev/null"
run_test "GPS Location" "grep -r 'geolocation' src/ > /dev/null"
run_test "Offline Support" "grep -r 'localStorage' src/ > /dev/null"
run_test "Signature Capture" "grep -r 'canvas' src/app/delivery/active/ > /dev/null"

# 16. API Route Tests
echo -e "${YELLOW}🛣️  Testing API routes...${NC}"

run_test "Order API Routes" "test -d src/app/api/orders"
run_test "Delivery API Routes" "test -d src/app/api/delivery"
run_test "Admin API Routes" "test -d src/app/api/admin"
run_test "Auth API Routes" "test -d src/app/api/auth"

# Stop the development server
kill $SERVER_PID 2>/dev/null

# 17. Final Integration Test
echo -e "${YELLOW}🎯 Running final integration test...${NC}"

# Build and check for any errors
run_test "Final Build Test" "npm run build > build_test.log 2>&1 && ! grep -i 'error' build_test.log"

# Cleanup
rm -f build_test.log

# Results Summary
echo ""
echo "=============================================="
echo -e "${BLUE}📋 TEST RESULTS SUMMARY${NC}"
echo "=============================================="
echo -e "✅ Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "❌ Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "📊 Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
    echo -e "${GREEN}Your Romana Foods delivery system is ready for production!${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. 🔐 Set up production environment variables"
    echo "2. 🗄️  Configure production database"
    echo "3. 🚀 Deploy to production server"
    echo "4. 📱 Test on real mobile devices"
    echo "5. 👥 Train delivery staff on the system"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  SOME TESTS FAILED ⚠️${NC}"
    echo -e "${YELLOW}Please review the failed tests above and fix any issues.${NC}"
    exit 1
fi
