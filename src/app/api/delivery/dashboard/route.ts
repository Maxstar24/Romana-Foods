import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

type OrderWithDetails = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: any;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
  address: {
    name: string;
    street: string;
    city: string;
    region: string;
  };
  items: Array<{
    quantity: number;
    product: {
      name: string;
    };
  }>;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'DELIVERY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deliveryPersonId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's deliveries for this delivery person
    const todayOrders = await prisma.order.findMany({
      where: {
        deliveryPersonId: deliveryPersonId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        address: {
          select: {
            name: true,
            street: true,
            city: true,
            region: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate stats
    const todayDeliveries = todayOrders.length;
    const completedToday = todayOrders.filter((order: OrderWithDetails) => order.status === 'DELIVERED').length;
    const pendingDeliveries = todayOrders.filter((order: OrderWithDetails) => 
      order.status === 'CONFIRMED' || order.status === 'SHIPPED'
    ).length;

    // Mock distance for now (could be calculated from GPS data in the future)
    const totalDistance = completedToday * 8.5; // Average 8.5km per delivery

    // Format today's deliveries for frontend
    const formattedDeliveries = todayOrders.map((order: OrderWithDetails, index: number) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.user.name || order.address.name,
      address: `${order.address.street}, ${order.address.city}`,
      status: order.status,
      estimatedDelivery: getEstimatedDeliveryTime(order.createdAt, index),
      total: Number(order.total),
      items: order.items.map((item: any) => ({
        name: item.product.name,
        quantity: item.quantity,
      })),
    }));

    const stats = {
      todayDeliveries,
      completedToday,
      pendingDeliveries,
      totalDistance: Math.round(totalDistance * 10) / 10, // Round to 1 decimal
    };

    return NextResponse.json({
      stats,
      todayDeliveries: formattedDeliveries,
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

// Helper function to generate estimated delivery times
function getEstimatedDeliveryTime(orderCreated: Date, index: number): string {
  const baseTime = new Date();
  baseTime.setHours(9, 0, 0, 0); // Start at 9 AM
  
  // Add 30 minutes per delivery + index * 45 minutes
  const deliveryTime = new Date(baseTime.getTime() + (index * 45 * 60 * 1000));
  
  return deliveryTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
