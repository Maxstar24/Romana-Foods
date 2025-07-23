import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/delivery-regions - Get all delivery regions with subregions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const regions = await prisma.deliveryRegion.findMany({
      include: {
        subregions: {
          orderBy: { sortOrder: 'asc' }
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

// POST /api/admin/delivery-regions - Create new delivery region
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, code, description, isActive = true, sortOrder = 0 } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Region name is required' },
        { status: 400 }
      );
    }

    const region = await prisma.deliveryRegion.create({
      data: {
        name,
        code,
        description,
        isActive,
        sortOrder,
      },
      include: {
        subregions: true
      }
    });

    return NextResponse.json({ region });

  } catch (error: any) {
    console.error('Error creating delivery region:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Region name or code already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create delivery region' },
      { status: 500 }
    );
  }
}
