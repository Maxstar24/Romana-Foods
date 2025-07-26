import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { optimizeDeliveryRoute, calculateRoute, Coordinates } from '@/lib/mapbox';

type OrderWithLocation = {
  id: string;
  orderNumber: string;
  status: any;
  address: {
    id: string;
    street: string;
    city: string;
    region: string;
    latitude: number;
    longitude: number;
  };
  user: {
    name: string | null;
    phone: string | null;
  };
};

type DeliveryDriver = {
  id: string;
  name: string | null;
  phone: string | null;
};

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all unassigned orders with addresses that have coordinates
    const unassignedOrders = await prisma.order.findMany({
      where: {
        deliveryPersonId: null,
        status: {
          in: ['CONFIRMED', 'PROCESSING'],
        },
        address: {
          AND: [
            { latitude: { not: null } },
            { longitude: { not: null } },
          ],
        },
      },
      include: {
        address: {
          select: {
            id: true,
            street: true,
            city: true,
            region: true,
            latitude: true,
            longitude: true,
          },
        },
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    if (unassignedOrders.length === 0) {
      return NextResponse.json({
        message: 'No orders available for route optimization',
        routes: [],
      });
    }

    // Get available delivery drivers
    const deliveryDrivers = await prisma.user.findMany({
      where: {
        role: 'DELIVERY',
      },
      select: {
        id: true,
        name: true,
        phone: true,
      },
    });

    if (deliveryDrivers.length === 0) {
      return NextResponse.json({
        error: 'No delivery drivers available',
      }, { status: 400 });
    }

    // Define depot location (company warehouse/office)
    const depot: Coordinates = {
      lat: -6.7924, // Dar es Salaam (adjust to your actual depot location)
      lng: 39.2083,
    };

    // Group orders by region for better route optimization
    const ordersByRegion = unassignedOrders.reduce((acc: Record<string, OrderWithLocation[]>, order: OrderWithLocation) => {
      const region = order.address.region;
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push(order);
      return acc;
    }, {} as Record<string, OrderWithLocation[]>);

    const optimizedRoutes = [];

    for (const [region, regionOrdersRaw] of Object.entries(ordersByRegion)) {
      const regionOrders = regionOrdersRaw as OrderWithLocation[];
      // Prepare stops for optimization
      const stops = regionOrders.map((order: OrderWithLocation) => ({
        id: order.id,
        coordinates: {
          lat: order.address.latitude!,
          lng: order.address.longitude!,
        },
      }));

      // Split into multiple routes if too many orders (max 12 per route for API limits)
      const maxOrdersPerRoute = 12;
      const routeChunks = [];
      
      for (let i = 0; i < stops.length; i += maxOrdersPerRoute) {
        routeChunks.push(stops.slice(i, i + maxOrdersPerRoute));
      }

      for (let chunkIndex = 0; chunkIndex < routeChunks.length; chunkIndex++) {
        const chunk = routeChunks[chunkIndex];
        
        try {
          // Optimize route using Mapbox
          const optimization = await optimizeDeliveryRoute(depot, chunk);
          
          if (optimization) {
            const { optimizedOrder, totalDistance, totalDuration } = optimization;
            
            // Assign to least loaded driver
            const driverOrderCounts = await Promise.all(
              deliveryDrivers.map(async (driver: DeliveryDriver) => {
                const count = await prisma.order.count({
                  where: {
                    deliveryPersonId: driver.id,
                    status: {
                      in: ['SHIPPED'],
                    },
                  },
                });
                return { driver, orderCount: count };
              })
            );
            
            const assignedDriver = driverOrderCounts.sort((a, b) => a.orderCount - b.orderCount)[0].driver;
            
            // Create optimized route
            const routeOrders = optimizedOrder.map(orderId => 
              regionOrders.find((order: OrderWithLocation) => order.id === orderId)!
            );
            
            optimizedRoutes.push({
              id: `route-${region}-${chunkIndex + 1}`,
              region,
              driverId: assignedDriver.id,
              driverName: assignedDriver.name,
              driverPhone: assignedDriver.phone,
              orders: routeOrders.map(order => ({
                id: order.id,
                orderNumber: order.orderNumber,
                customerName: order.user.name,
                address: `${order.address.street}, ${order.address.city}`,
                coordinates: {
                  lat: order.address.latitude!,
                  lng: order.address.longitude!,
                },
              })),
              totalDistance: Math.round(totalDistance),
              totalDuration: Math.round(totalDuration / 60), // Convert to minutes
              estimatedStops: routeOrders.length,
            });
            
          } else {
            // Fallback: simple assignment without optimization
            const assignedDriver = deliveryDrivers[chunkIndex % deliveryDrivers.length];
            
            optimizedRoutes.push({
              id: `route-${region}-${chunkIndex + 1}`,
              region,
              driverId: assignedDriver.id,
              driverName: assignedDriver.name,
              driverPhone: assignedDriver.phone,
              orders: chunk.map((stop: any) => {
                const order = regionOrders.find((o: OrderWithLocation) => o.id === stop.id)!;
                return {
                  id: order.id,
                  orderNumber: order.orderNumber,
                  customerName: order.user.name,
                  address: `${order.address.street}, ${order.address.city}`,
                  coordinates: stop.coordinates,
                };
              }),
              totalDistance: 0, // Will be calculated later
              totalDuration: 0,
              estimatedStops: chunk.length,
            });
          }
        } catch (error) {
          console.error('Route optimization failed for chunk:', error);
        }
      }
    }

    return NextResponse.json({
      message: `Generated ${optimizedRoutes.length} optimized delivery routes`,
      routes: optimizedRoutes,
      summary: {
        totalOrders: unassignedOrders.length,
        totalRoutes: optimizedRoutes.length,
        driversAssigned: [...new Set(optimizedRoutes.map(r => r.driverId))].length,
      },
    });

  } catch (error) {
    console.error('Route optimization API error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize delivery routes' },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Auto-assign optimized routes
    const response = await POST();
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const assignments = [];
      
      for (const route of data.routes) {
        const orderIds = route.orders.map((order: any) => order.id);
        
        // Update orders with delivery person assignment
        const result = await prisma.order.updateMany({
          where: {
            id: {
              in: orderIds,
            },
            status: {
              in: ['CONFIRMED', 'PROCESSING'],
            },
          },
          data: {
            deliveryPersonId: route.driverId,
            status: 'SHIPPED',
          },
        });
        
        assignments.push({
          driverId: route.driverId,
          driverName: route.driverName,
          ordersAssigned: result.count,
          routeInfo: {
            region: route.region,
            totalDistance: route.totalDistance,
            totalDuration: route.totalDuration,
            estimatedStops: route.estimatedStops,
          },
        });
      }
      
      return NextResponse.json({
        message: 'Routes automatically assigned to delivery drivers',
        assignments,
        summary: data.summary,
      });
    }
    
    return NextResponse.json({
      message: 'No routes available for assignment',
      assignments: [],
    });

  } catch (error) {
    console.error('Auto-assignment error:', error);
    return NextResponse.json(
      { error: 'Failed to auto-assign delivery routes' },
      { status: 500 }
    );
  }
}
