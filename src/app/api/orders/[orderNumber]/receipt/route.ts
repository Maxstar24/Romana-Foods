import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils/order";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        address: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
              }
            }
          }
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user owns this order or is admin
    if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Only allow receipt download for delivered orders
    if (order.status !== 'DELIVERED') {
      return NextResponse.json(
        { error: 'Receipt only available for delivered orders' },
        { status: 400 }
      );
    }

    // Generate HTML receipt
    const receiptHtml = generateReceiptHTML(order);

    // Return HTML content that can be viewed in browser or printed as PDF
    return new Response(receiptHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="romana-receipt-${orderNumber}.html"`,
      },
    });

  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    );
  }
}

function generateReceiptHTML(order: any): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Romana Foods - Receipt #${order.orderNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 5px;
        }
        .receipt-title {
          font-size: 20px;
          margin: 20px 0;
        }
        .order-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 18px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #333;
        }
        .qr-section {
          text-align: center;
          margin: 30px 0;
        }
        .tracking-hash {
          font-family: monospace;
          font-size: 12px;
          background: #f5f5f5;
          padding: 10px;
          border-radius: 5px;
          word-break: break-all;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 14px;
        }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Romana Foods</div>
        <div>Fresh, Organic Products Delivered to Your Door</div>
        <div class="receipt-title">OFFICIAL RECEIPT</div>
      </div>

      <div class="order-info">
        <div>
          <strong>Order Number:</strong> ${order.orderNumber}<br>
          <strong>Order Date:</strong> ${formatDate(order.createdAt)}<br>
          <strong>Delivery Date:</strong> ${order.deliveredAt ? formatDate(order.deliveredAt) : 'N/A'}
        </div>
        <div>
          <strong>Customer:</strong> ${order.user.name}<br>
          <strong>Email:</strong> ${order.user.email}<br>
          <strong>Status:</strong> ${order.status}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Delivery Address</div>
        <div>
          ${order.address.name}<br>
          ${order.address.street}<br>
          ${order.address.city}, ${order.address.region}<br>
          ${order.address.country}<br>
          Phone: ${order.address.phone}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Order Items</div>
        ${order.items.map((item: any) => `
          <div class="item-row">
            <div>
              <strong>${item.product.name}</strong><br>
              Quantity: ${item.quantity} × ${formatPrice(item.price)}
            </div>
            <div>${formatPrice(item.price * item.quantity)}</div>
          </div>
        `).join('')}
        
        <div class="item-row">
          <div>Shipping Cost</div>
          <div>${formatPrice(order.shippingCost)}</div>
        </div>
        
        <div class="total-row">
          <div>TOTAL PAID</div>
          <div>${formatPrice(order.total)}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Payment Information</div>
        <div>
          <strong>Payment Status:</strong> ${order.paymentStatus}<br>
          <strong>Payment Method:</strong> Cash on Delivery
        </div>
      </div>

      <div class="qr-section">
        <div class="section-title">Verification QR Code</div>
        <img src="${order.qrCode}" alt="Order QR Code" style="width: 150px; height: 150px;">
        <div style="margin-top: 10px;">
          <strong>Tracking Hash (SHA256):</strong>
          <div class="tracking-hash">${order.trackingHash || 'Not available'}</div>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for choosing Romana Foods!</p>
        <p>This is an official receipt for your order. Please keep it for your records.</p>
        <p>For any questions or concerns, please contact our customer support.</p>
        <p>Visit us at: www.romana.co.tz | Email: support@romana.co.tz</p>
        <p><em>Generated on ${formatDate(new Date().toISOString())}</em></p>
      </div>
    </body>
    </html>
  `;
}
