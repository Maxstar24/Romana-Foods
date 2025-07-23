import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/delivery-regions/[regionId]/subregions - Create new subregion
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ regionId: string }> }
) {
  try {
    const { regionId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, code, description, deliveryFee, isActive = true, sortOrder = 0 } = body;

    if (!name || deliveryFee === undefined) {
      return NextResponse.json(
        { error: 'Subregion name and delivery fee are required' },
        { status: 400 }
      );
    }

    // Verify region exists
    const region = await prisma.deliveryRegion.findUnique({
      where: { id: regionId }
    });

    if (!region) {
      return NextResponse.json(
        { error: 'Region not found' },
        { status: 404 }
      );
    }

    const subregion = await prisma.deliverySubregion.create({
      data: {
        regionId,
        name,
        code,
        description,
        deliveryFee: parseFloat(deliveryFee),
        isActive,
        sortOrder,
      },
      include: {
        region: true
      }
    });

    return NextResponse.json({ subregion });

  } catch (error: any) {
    console.error('Error creating delivery subregion:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Subregion name already exists in this region' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create delivery subregion' },
      { status: 500 }
    );
  }
}

// GET /api/admin/delivery-regions/[regionId]/subregions - Get subregions for a region
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ regionId: string }> }
) {
  try {
    const { regionId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const subregions = await prisma.deliverySubregion.findMany({
      where: { regionId },
      include: {
        region: true
      },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json({ subregions });

  } catch (error) {
    console.error('Error fetching delivery subregions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery subregions' },
      { status: 500 }
    );
  }
}
