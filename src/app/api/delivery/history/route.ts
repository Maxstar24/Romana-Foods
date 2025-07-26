import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type DeliveredOrder = {
  id: string;
  orderNumber: string;
  total: any;
  status: any;
  deliveryCompletedAt: Date | null;
  deliveryNotes: string | null;
  deliverySignatureHash: string | null;
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
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'DELIVERY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deliveryPersonId = session.user.id;

    // Get all delivered orders for this delivery person
    const deliveredOrders = await prisma.order.findMany({
      where: {
        deliveryPersonId: deliveryPersonId,
        status: 'DELIVERED',
        deliveryCompletedAt: {
          not: null,
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
      },
      orderBy: {
        deliveryCompletedAt: 'desc',
      },
    });

    // Calculate stats
    const totalDeliveries = deliveredOrders.length;
    const successfulDeliveries = deliveredOrders.filter((order: DeliveredOrder) => 
      order.status === 'DELIVERED'
    ).length;
    
    // Calculate average delivery time (from order creation to delivery completion)
    let totalDeliveryTime = 0;
    let deliveriesWithTime = 0;
    
    deliveredOrders.forEach((order: DeliveredOrder) => {
      if (order.deliveryCompletedAt && order.createdAt) {
        const deliveryTime = order.deliveryCompletedAt.getTime() - order.createdAt.getTime();
        totalDeliveryTime += deliveryTime;
        deliveriesWithTime++;
      }
    });
    
    const averageTimeMs = deliveriesWithTime > 0 ? totalDeliveryTime / deliveriesWithTime : 0;
    const averageHours = Math.floor(averageTimeMs / (1000 * 60 * 60));
    const averageMinutes = Math.floor((averageTimeMs % (1000 * 60 * 60)) / (1000 * 60));
    const averageTime = `${averageHours}h ${averageMinutes}m`;

    // Calculate total earnings (mock calculation - could be based on delivery fees)
    const totalEarnings = totalDeliveries * 5000; // 5000 TZS per delivery

    // Format delivery history for frontend
    const deliveryHistory = deliveredOrders.map((order: DeliveredOrder) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.user.name || order.address.name,
      address: `${order.address.street}, ${order.address.city}`,
      deliveredAt: order.deliveryCompletedAt?.toISOString() || '',
      total: Number(order.total),
      status: 'DELIVERED' as const,
      notes: order.deliveryNotes || undefined,
      signature: !!order.deliverySignatureHash,
    }));

    const stats = {
      totalDeliveries,
      successfulDeliveries,
      averageTime,
      totalEarnings,
    };

    return NextResponse.json({
      deliveries: deliveryHistory,
      stats,
    });

  } catch (error) {
    console.error('Delivery history API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery history' },
      { status: 500 }
    );
  }
}
