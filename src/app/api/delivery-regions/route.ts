import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/delivery-regions - Get all active delivery regions with subregions
export async function GET(request: NextRequest) {
  try {
    const regions = await prisma.deliveryRegion.findMany({
      where: { isActive: true },
      include: {
        subregions: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            code: true,
            deliveryFee: true,
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json({ regions });

  } catch (error) {
    console.error('Error fetching delivery regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery regions' },
      { status: 500 }
    );
  }
}
