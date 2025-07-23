import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { orderNumber } = await params;

    // Build where clause based on user role
    const where = session.user.role === 'ADMIN' 
      ? { orderNumber } // Admin can see any order
      : { orderNumber, userId: session.user.id }; // Customers can only see their own orders

    const order = await prisma.order.findUnique({
      where: where as any, // TypeScript workaround for complex where clause
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        address: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
                slug: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order,
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PATCH endpoint for updating order status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { orderNumber } = await params;
    const body = await request.json();
    const { status, paymentStatus, adminNotes } = body;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order in transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update the order
      const updated = await tx.order.update({
        where: { orderNumber },
        data: {
          ...(status && { status }),
          ...(paymentStatus && { paymentStatus }),
          ...(adminNotes !== undefined && { adminNotes }),
          ...(status === 'SHIPPED' && !order.shippedAt && { shippedAt: new Date() }),
          ...(status === 'DELIVERED' && !order.deliveredAt && { deliveredAt: new Date() }),
        },
      });

      // Add status history if status changed
      if (status && status !== order.status) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status,
            notes: adminNotes || `Order status updated to ${status}`,
          },
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
