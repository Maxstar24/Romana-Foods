import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignTestDeliveries() {
  console.log('🚚 Assigning test deliveries...');

  try {
    // Get some orders that need delivery assignment
    const availableOrders = await prisma.order.findMany({
      where: {
        deliveryPersonId: null,
        status: {
          in: ['CONFIRMED', 'PROCESSING'],
        },
      },
      take: 3, // Get up to 3 orders
    });

    // Get delivery personnel
    const deliveryPersonnel = await prisma.user.findMany({
      where: {
        role: 'DELIVERY',
      },
      take: 2, // Get up to 2 delivery people
    });

    if (availableOrders.length === 0) {
      console.log('📦 No unassigned orders found. Creating some test orders...');
      
      // Get a test customer
      const customer = await prisma.user.findFirst({
        where: { role: 'CUSTOMER' },
      });

      if (customer) {
        const address = await prisma.address.findFirst({
          where: { userId: customer.id },
        });

        if (address) {
          // Create a test order
          const newOrder = await prisma.order.create({
            data: {
              userId: customer.id,
              addressId: address.id,
              orderNumber: `RMN${Date.now()}TEST`,
              qrCode: `https://www.romana-natural-products.org/orders/RMN${Date.now()}TEST`,
              trackingHash: `TEST_${Date.now()}`,
              status: 'CONFIRMED',
              paymentStatus: 'CONFIRMED',
              subtotal: 25000,
              shippingCost: 3000,
              total: 28000,
            },
          });
          
          availableOrders.push(newOrder);
          console.log('✅ Created test order:', newOrder.orderNumber);
        }
      }
    }

    if (deliveryPersonnel.length === 0) {
      console.log('❌ No delivery personnel found. Please create delivery users first.');
      return;
    }

    // Assign orders to delivery personnel
    let assignedCount = 0;
    for (let i = 0; i < availableOrders.length && i < 3; i++) {
      const order = availableOrders[i];
      const deliveryPerson = deliveryPersonnel[i % deliveryPersonnel.length];

      await prisma.order.update({
        where: { id: order.id },
        data: {
          deliveryPersonId: deliveryPerson.id,
          status: 'SHIPPED',
          shippedAt: new Date(),
          deliveryStartedAt: new Date(),
        },
      });

      console.log(`✅ Assigned order ${order.orderNumber} to ${deliveryPerson.name}`);
      assignedCount++;
    }

    console.log(`🎉 Successfully assigned ${assignedCount} orders to delivery personnel!`);
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Login as a delivery user');
    console.log('2. Go to /delivery dashboard');
    console.log('3. See your real assigned orders!');

  } catch (error) {
    console.error('❌ Error assigning deliveries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignTestDeliveries();
