import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type OrderWithDetails = {
  id: string;
  orderNumber: string;
  status: any;
  total: any;
  createdAt: Date;
  deliveryStartedAt: Date | null;
  deliveryCompletedAt: Date | null;
  gpsDeliveryLocation: string | null;
  user: {
    name: string | null;
    email: string;
    phone: string | null;
  };
  address: {
    name: string;
    street: string;
    city: string;
    region: string;
    zipCode: string | null;
    gpsCoordinates: string | null;
  };
  items: Array<{
    quantity: number;
    product: {
      name: string;
    };
  }>;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'DELIVERY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deliveryPersonId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's assigned orders
    const todayOrders = await prisma.order.findMany({
      where: {
        deliveryPersonId: deliveryPersonId,
        OR: [
          {
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
          },
          {
            status: {
              in: ['SHIPPED'],
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        address: {
          select: {
            name: true,
            street: true,
            city: true,
            region: true,
            zipCode: true,
            gpsCoordinates: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // If no orders found, return empty but valid response
    if (todayOrders.length === 0) {
      return NextResponse.json({
        routes: [],
        summary: {
          totalRoutes: 0,
          totalStops: 0,
          completedStops: 0,
        },
      });
    }

    // Group orders by region to create routes
    const routesByRegion = new Map();
    
    todayOrders.forEach((order: OrderWithDetails) => {
      const region = order.address.region;
      if (!routesByRegion.has(region)) {
        routesByRegion.set(region, []);
      }
      routesByRegion.get(region).push(order);
    });

    // Convert to route format
    const routes = Array.from(routesByRegion.entries()).map(([region, orders], index) => {
      const orderList = orders as OrderWithDetails[];
      const totalStops = orderList.length;
      const completedStops = orderList.filter((order: OrderWithDetails) => order.status === 'DELIVERED').length;
      const inProgressStops = orderList.filter((order: OrderWithDetails) => order.status === 'SHIPPED').length;
      
      // Estimate duration based on number of stops (30 min per stop + travel time)
      const estimatedDuration = `${Math.ceil(totalStops * 0.75)}h ${(totalStops * 45) % 60}m`;
      
      // Calculate distance estimate (average 5km between stops)
      const totalDistance = `${(totalStops * 5).toFixed(1)} km`;
      
      // Determine route status
      let routeStatus: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' = 'PLANNED';
      if (completedStops === totalStops && totalStops > 0) {
        routeStatus = 'COMPLETED';
      } else if (inProgressStops > 0 || completedStops > 0) {
        routeStatus = 'IN_PROGRESS';
      }

      // Format stops for frontend
      const stops = orderList.map((order: OrderWithDetails, stopIndex: number) => {
        // Parse GPS coordinates if available
        let coordinates: [number, number] = [-6.7924, 39.2083]; // Default Dar es Salaam
        if (order.address.gpsCoordinates) {
          try {
            const coords = JSON.parse(order.address.gpsCoordinates);
            coordinates = [coords.lat, coords.lng];
          } catch (e) {
            console.warn('Failed to parse GPS coordinates:', order.address.gpsCoordinates);
          }
        }

        // Calculate estimated time based on order index
        const baseTime = new Date();
        baseTime.setHours(9, 0, 0, 0); // Start at 9 AM
        const estimatedTime = new Date(baseTime.getTime() + (stopIndex * 45 * 60 * 1000));

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.user.name || order.address.name,
          address: `${order.address.street}, ${order.address.city}`,
          coordinates,
          estimatedTime: estimatedTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
          status: order.status === 'DELIVERED' ? 'DELIVERED' : 
                 order.status === 'SHIPPED' ? 'SHIPPED' : 'PENDING',
          priority: stopIndex + 1,
          items: order.items.map((item: any) => ({
            name: item.product.name,
            quantity: item.quantity,
          })),
        };
      });

      const routeName = index === 0 ? `Morning Route - ${region}` : `Afternoon Route - ${region}`;

      return {
        id: `route-${index + 1}`,
        name: routeName,
        totalStops,
        estimatedDuration,
        totalDistance,
        status: routeStatus,
        stops,
      };
    });

    return NextResponse.json({
      routes,
      summary: {
        totalRoutes: routes.length,
        totalStops: todayOrders.length,
        completedStops: todayOrders.filter((order: OrderWithDetails) => order.status === 'DELIVERED').length,
      },
    });

  } catch (error) {
    console.error('Routes API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routes data' },
      { status: 500 }
    );
  }
}
