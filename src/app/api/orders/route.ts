import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber, generateQRCode, generateTrackingHash } from "@/lib/utils/order";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, shippingAddress, paymentMethod, subtotal, shippingCost, total } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.street) {
      return NextResponse.json(
        { error: 'Complete shipping address is required' },
        { status: 400 }
      );
    }

    // Validate inventory for all items
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { inventory: true, price: true, isActive: true }
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          { error: `Product is not available: ${item.productId}` },
          { status: 400 }
        );
      }

      if (product.inventory < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient inventory for product: ${item.productId}. Available: ${product.inventory}` },
          { status: 400 }
        );
      }
    }

    // Generate order details
    const orderNumber = generateOrderNumber();
    const trackingHash = generateTrackingHash(orderNumber, session.user.email!);

    // Create or find address
    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        city: shippingAddress.city,
        region: shippingAddress.region,
        zipCode: shippingAddress.zipCode || null,
        country: shippingAddress.country || 'Tanzania',
      },
    });

    // Generate QR code
    const qrCode = await generateQRCode(orderNumber);

    // Create order with transaction
    const order = await prisma.$transaction(async (tx: any) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          qrCode,
          trackingHash,
          userId: session.user.id,
          addressId: address.id,
          subtotal,
          shippingCost,
          total,
          status: 'PENDING',
          paymentStatus: paymentMethod.type === 'cash_on_delivery' ? 'PENDING' : 'PENDING',
        },
      });

      // Create order items and update inventory temporarily
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });

        // For now, immediately decrease inventory on order creation
        // TODO: Implement proper stock reservation system
        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Create initial status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          status: 'PENDING',
          notes: 'Order placed successfully',
        },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        qrCode: order.qrCode,
        status: order.status,
        total: order.total,
      },
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get orders for the authenticated user
    const where = session.user.role === 'ADMIN' 
      ? {} // Admin can see all orders
      : { userId: session.user.id }; // Customers can only see their own orders

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          deliveryPerson: {
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
                },
              },
            },
          },
          statusHistory: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
