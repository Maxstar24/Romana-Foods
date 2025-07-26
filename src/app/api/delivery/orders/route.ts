import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'DELIVERY') {
      return NextResponse.json(
        { error: 'Delivery access required' },
        { status: 403 }
      );
    }

    // Get delivery person's assigned orders for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const orders = await prisma.order.findMany({
      where: {
        deliveryPersonId: session.user.id,
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED']
        },
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
            phone: true,
          },
        },
        address: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate delivery stats
    const stats = {
      todayDeliveries: orders.length,
      completedToday: orders.filter((o: any) => o.status === 'DELIVERED').length,
      pendingDeliveries: orders.filter((o: any) => o.status !== 'DELIVERED').length,
      totalDistance: 0, // TODO: Calculate from GPS coordinates
    };

    return NextResponse.json({
      success: true,
      orders,
      stats,
    });

  } catch (error) {
    console.error('Error fetching delivery data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery data' },
      { status: 500 }
    );
  }
}

// Update delivery status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'DELIVERY') {
      return NextResponse.json(
        { error: 'Delivery access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderNumber, status, signatureHash, gpsLocation, notes } = body;

    // Verify the order is assigned to this delivery person
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        deliveryPersonId: session.user.id,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or not assigned to you' },
        { status: 404 }
      );
    }

    // Update order with delivery information
    const updatedOrder = await prisma.order.update({
      where: { orderNumber },
      data: {
        status,
        ...(status === 'SHIPPED' && !order.deliveryStartedAt && {
          deliveryStartedAt: new Date(),
        }),
        ...(status === 'DELIVERED' && {
          deliveredAt: new Date(),
          deliveryCompletedAt: new Date(),
          ...(signatureHash && { deliverySignatureHash: signatureHash }),
          ...(gpsLocation && { gpsDeliveryLocation: gpsLocation }),
          ...(notes && { deliveryNotes: notes }),
        }),
      },
    });

    // Add to status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status,
        notes: notes || `Delivery status updated to ${status} by ${session.user.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });

  } catch (error) {
    console.error('Error updating delivery status:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery status' },
      { status: 500 }
    );
  }
}
