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

    // Get dashboard statistics
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      pendingOrders,
      lowStockProducts,
    ] = await Promise.all([
      // Total orders count
      prisma.order.count(),
      
      // Total revenue (sum of all order totals)
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
      }),
      
      // Total products count
      prisma.product.count({
        where: {
          isActive: true,
        },
      }),
      
      // Total customers count
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
        },
      }),
      
      // Pending orders count
      prisma.order.count({
        where: {
          status: 'PENDING',
        },
      }),
      
      // Low stock products count (inventory <= 10)
      prisma.product.count({
        where: {
          inventory: {
            lte: 10,
          },
          isActive: true,
        },
      }),
    ]);

    const stats = {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      totalProducts,
      totalCustomers,
      pendingOrders,
      lowStockProducts,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
