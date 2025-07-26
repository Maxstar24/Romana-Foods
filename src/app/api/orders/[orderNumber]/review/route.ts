import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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
    const body = await request.json();
    const { rating, comment, issueType, issueDescription } = body;

    // Verify the order belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: session.user.id,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Create or update review
    const review = await prisma.orderReview.upsert({
      where: { orderNumber },
      update: {
        rating,
        comment,
        issueType,
        issueDescription,
        updatedAt: new Date(),
      },
      create: {
        orderNumber,
        userId: session.user.id,
        rating,
        comment,
        issueType,
        issueDescription,
      },
    });

    // If there's an issue, mark it as unresolved
    if (issueType && issueDescription) {
      await prisma.orderReview.update({
        where: { id: review.id },
        data: { isResolved: false },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });

  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
