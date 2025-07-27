import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all users with DELIVERY role
    const deliveryPersons = await prisma.user.findMany({
      where: {
        role: 'DELIVERY',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      deliveryPersons,
    });

  } catch (error) {
    console.error('Error fetching delivery personnel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery personnel' },
      { status: 500 }
    );
  }
}
