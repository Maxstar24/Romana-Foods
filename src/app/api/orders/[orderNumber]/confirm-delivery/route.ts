import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const body = await request.json();
    const { customerConfirmed, confirmedAt } = body;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'DELIVERED') {
      return NextResponse.json(
        { error: 'Order must be delivered before confirmation' },
        { status: 400 }
      );
    }

    // Update order with customer confirmation
    const updatedOrder = await prisma.order.update({
      where: { orderNumber },
      data: {
        customerConfirmedAt: new Date(confirmedAt),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery confirmed successfully',
      order: updatedOrder,
    });

  } catch (error) {
    console.error('Error confirming delivery:', error);
    return NextResponse.json(
      { error: 'Failed to confirm delivery' },
      { status: 500 }
    );
  }
}
