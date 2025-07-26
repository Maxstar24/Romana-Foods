#!/bin/bash

# Quick script to assign existing orders to delivery drivers for testing

echo "🚚 Assigning orders to delivery drivers..."

# Get delivery person IDs (you may need to adjust these based on your actual data)
# You can check Prisma Studio to get the actual IDs

# Example API call to assign orders (replace with actual order and driver IDs)
echo "📦 Making API call to assign deliveries..."

# This would be run by an admin to assign orders
curl -X PATCH http://localhost:3000/api/admin/assign-deliveries \
  -H "Content-Type: application/json" \
  -d '{
    "orderIds": ["ORDER_ID_1", "ORDER_ID_2"],
    "deliveryPersonId": "DELIVERY_PERSON_ID"
  }'

echo ""
echo "✅ Assignment script complete!"
echo "💡 To use this script:"
echo "1. Go to Prisma Studio (http://localhost:5555)"
echo "2. Copy the IDs of orders you want to assign"
echo "3. Copy the ID of a delivery person"
echo "4. Update this script with the real IDs"
echo "5. Run the script or use the API directly"
