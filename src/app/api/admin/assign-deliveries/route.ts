import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type OrderForAssignment = {
  id: string;
  orderNumber: string;
  status: any;
  total: any;
  createdAt: Date;
  user: {
    name: string | null;
  };
  address: {
    name: string;
    street: string;
    city: string;
  };
};

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderIds, deliveryPersonId } = await request.json();

    if (!orderIds || !Array.isArray(orderIds) || !deliveryPersonId) {
      return NextResponse.json(
        { error: 'Missing orderIds array or deliveryPersonId' },
        { status: 400 }
      );
    }

    // Verify the delivery person exists and has DELIVERY role
    const deliveryPerson = await prisma.user.findFirst({
      where: {
        id: deliveryPersonId,
        role: 'DELIVERY',
      },
    });

    if (!deliveryPerson) {
      return NextResponse.json(
        { error: 'Invalid delivery person' },
        { status: 400 }
      );
    }

    // Update orders to assign delivery person and change status to SHIPPED
    const updatedOrders = await prisma.order.updateMany({
      where: {
        id: {
          in: orderIds,
        },
        status: {
          in: ['CONFIRMED', 'PROCESSING'],
        },
      },
      data: {
        deliveryPersonId: deliveryPersonId,
        status: 'SHIPPED',
        shippedAt: new Date(),
        deliveryStartedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: `Successfully assigned ${updatedOrders.count} orders to ${deliveryPerson.name}`,
      assignedOrders: updatedOrders.count,
    });

  } catch (error) {
    console.error('Assign delivery error:', error);
    return NextResponse.json(
      { error: 'Failed to assign deliveries' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch available orders and delivery personnel
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get unassigned orders
    const availableOrders = await prisma.order.findMany({
      where: {
        deliveryPersonId: null,
        status: {
          in: ['CONFIRMED', 'PROCESSING'],
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
        createdAt: 'asc',
      },
    });

    // Get available delivery personnel
    const deliveryPersonnel = await prisma.user.findMany({
      where: {
        role: 'DELIVERY',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({
      availableOrders: availableOrders.map((order: OrderForAssignment) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.user.name || order.address.name,
        address: `${order.address.street}, ${order.address.city}`,
        total: Number(order.total),
        status: order.status,
        createdAt: order.createdAt,
      })),
      deliveryPersonnel,
    });

  } catch (error) {
    console.error('Fetch assignment data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignment data' },
      { status: 500 }
    );
  }
}
