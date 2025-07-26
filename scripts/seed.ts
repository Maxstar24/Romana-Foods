import { PrismaClient, UserRole, OrderStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('Romana2025!Admin$', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@romana-natural-products.org' },
    update: {},
    create: {
      email: 'admin@romana-natural-products.org',
      name: 'Romana Foods Admin',
      password: hashedAdminPassword,
      role: 'ADMIN',
      phone: '+255767266355',
    },
  });

  // Create demo customer
  const hashedCustomerPassword = await bcrypt.hash('password', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'Demo Customer',
      password: hashedCustomerPassword,
      role: 'CUSTOMER',
      phone: '+255123456789',
    },
  });

  // Create test delivery person
  const hashedDeliveryPassword = await bcrypt.hash('delivery123', 12);
  const deliveryPerson = await prisma.user.upsert({
    where: { email: 'delivery@romana-natural-products.org' },
    update: {},
    create: {
      email: 'delivery@romana-natural-products.org',
      name: 'Test Delivery Person',
      password: hashedDeliveryPassword,
      role: 'DELIVERY' as UserRole,
      phone: '+255700123456',
    },
  });

  console.log('✅ Users created:', { 
    admin: admin.email, 
    customer: customer.email,
    delivery: deliveryPerson.email 
  });

  // Create categories
  const categories = [
    {
      name: 'Organic Juices',
      slug: 'organic-juices',
      description: 'Fresh-pressed organic juices packed with vitamins and minerals',
      sortOrder: 1,
    },
    {
      name: 'Health Foods',
      slug: 'health-foods',
      description: 'Nutritious organic foods for a healthy lifestyle',
      sortOrder: 2,
    },
    {
      name: 'Bakery',
      slug: 'bakery',
      description: 'Fresh baked goods made with organic ingredients',
      sortOrder: 3,
    },
    {
      name: 'General Goods',
      slug: 'general-goods',
      description: 'Everyday organic products for your home',
      sortOrder: 4,
    },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    createdCategories.push(created);
  }

  console.log('✅ Categories created:', createdCategories.map(c => c.name));

  // Create sample products
  const products = [
    {
      name: 'Premium Orange Juice',
      slug: 'premium-orange-juice',
      description: 'Fresh-pressed organic orange juice with no added sugar. Rich in vitamin C and natural antioxidants.',
      price: 8500, // 8,500 TZS
      images: ['/images/products/WhatsApp Image 2025-07-20 at 19.51.03.jpeg'],
      categorySlug: 'organic-juices',
      inventory: 50,
      isFeatured: true,
      weight: 0.5,
      unit: 'bottle (500ml)',
    },
    {
      name: 'Mixed Fruit Juice',
      slug: 'mixed-fruit-juice',
      description: 'A delicious blend of organic fruits including oranges, mangoes, and passion fruit.',
      price: 9500,
      images: ['/images/products/WhatsApp Image 2025-07-20 at 19.51.04.jpeg'],
      categorySlug: 'organic-juices',
      inventory: 30,
      isFeatured: true,
      weight: 0.5,
      unit: 'bottle (500ml)',
    },
    {
      name: 'Organic Energy Blend',
      slug: 'organic-energy-blend',
      description: 'Superfood blend designed to boost energy and support immune system naturally.',
      price: 15000,
      images: ['/images/products/WhatsApp Image 2025-07-21 at 19.03.45.jpeg'],
      categorySlug: 'health-foods',
      inventory: 25,
      isFeatured: true,
      weight: 0.25,
      unit: 'pack (250g)',
    },
    {
      name: 'Antioxidant Superfood Mix',
      slug: 'antioxidant-superfood-mix',
      description: 'Premium blend of antioxidant-rich superfoods for optimal health and wellness.',
      price: 18000,
      images: ['/images/products/WhatsApp Image 2025-07-21 at 19.03.47.jpeg'],
      categorySlug: 'health-foods',
      inventory: 20,
      weight: 0.3,
      unit: 'pack (300g)',
    },
    {
      name: 'Tropical Fruit Smoothie',
      slug: 'tropical-fruit-smoothie',
      description: 'Refreshing tropical fruit smoothie with mango, pineapple, and coconut.',
      price: 7500,
      images: ['/images/products/WhatsApp Image 2025-07-21 at 19.03.48.jpeg'],
      categorySlug: 'organic-juices',
      inventory: 35,
      weight: 0.4,
      unit: 'bottle (400ml)',
    },
    {
      name: 'Wellness Support Pack',
      slug: 'wellness-support-pack',
      description: 'Complete wellness package with natural ingredients to support your health journey.',
      price: 22000,
      images: ['/images/products/WhatsApp Image 2025-07-21 at 19.03.50.jpeg'],
      categorySlug: 'health-foods',
      inventory: 15,
      weight: 0.5,
      unit: 'pack',
    },
  ];

  for (const product of products) {
    const category = createdCategories.find(c => c.slug === product.categorySlug);
    if (!category) {
      console.log(`❌ Category not found for product: ${product.name}`);
      continue;
    }

    const { categorySlug, ...productData } = product;
    
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...productData,
        categoryId: category.id,
      },
    });
  }

  console.log('✅ Sample products created');

  // Create a demo address for the customer
  const existingAddress = await prisma.address.findFirst({
    where: {
      userId: customer.id,
      isDefault: true,
    },
  });

  if (!existingAddress) {
    await prisma.address.create({
      data: {
        userId: customer.id,
        name: 'Demo Customer',
        street: '123 Uhuru Street',
        city: 'Dar es Salaam',
        region: 'Dar es Salaam',
        zipCode: '11101',
        country: 'Tanzania',
        phone: '+255123456789',
        isDefault: true,
      },
    });
  }

  console.log('✅ Demo address created');

  // Create delivery regions for Tanzania
  const deliveryRegions = [
    {
      name: 'Dar es Salaam Central',
      code: 'DSM-C',
      description: 'Central Dar es Salaam delivery area',
      isActive: true,
    },
    {
      name: 'Dar es Salaam Suburbs',
      code: 'DSM-S',
      description: 'Suburban areas of Dar es Salaam',
      isActive: true,
    },
    {
      name: 'Dodoma',
      code: 'DDM',
      description: 'Dodoma region delivery',
      isActive: true,
    },
  ];

  const createdRegions = [];
  for (const region of deliveryRegions) {
    const created = await prisma.deliveryRegion.upsert({
      where: { name: region.name },
      update: {},
      create: region,
    });
    createdRegions.push(created);
  }

  console.log('✅ Delivery regions created:', createdRegions.map(r => r.name));

  // Create delivery subregions
  const subregions = [
    { name: 'Kariakoo', regionName: 'Dar es Salaam Central', deliveryFee: 2500 },
    { name: 'Msimbazi', regionName: 'Dar es Salaam Central', deliveryFee: 3000 },
    { name: 'Kinondoni', regionName: 'Dar es Salaam Suburbs', deliveryFee: 4500 },
    { name: 'Temeke', regionName: 'Dar es Salaam Suburbs', deliveryFee: 5000 },
    { name: 'Dodoma City', regionName: 'Dodoma', deliveryFee: 7500 },
  ];

  for (const subregion of subregions) {
    const region = createdRegions.find(r => r.name === subregion.regionName);
    if (region) {
      await prisma.deliverySubregion.upsert({
        where: { 
          regionId_name: { 
            regionId: region.id, 
            name: subregion.name 
          } 
        },
        update: {},
        create: {
          name: subregion.name,
          regionId: region.id,
          deliveryFee: subregion.deliveryFee,
          isActive: true,
        },
      });
    }
  }

  console.log('✅ Delivery subregions created');

  // Create additional test users for delivery testing
  const additionalUsers = [
    {
      email: 'driver1@romana.com',
      name: 'John Mwalimu',
      password: await bcrypt.hash('driver123', 12),
      role: 'DELIVERY' as UserRole,
      phone: '+255700111222',
    },
    {
      email: 'driver2@romana.com',
      name: 'Mary Kilimo',
      password: await bcrypt.hash('driver123', 12),
      role: 'DELIVERY' as UserRole,
      phone: '+255700333444',
    },
    {
      email: 'customer1@test.com',
      name: 'Ahmed Hassan',
      password: await bcrypt.hash('test123', 12),
      role: 'CUSTOMER',
      phone: '+255700555666',
    },
    {
      email: 'customer2@test.com',
      name: 'Grace Mwenda',
      password: await bcrypt.hash('test123', 12),
      role: 'CUSTOMER',
      phone: '+255700777888',
    },
  ];

  const createdTestUsers = [];
  for (const userData of additionalUsers) {
    const created = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        password: userData.password,
        role: userData.role as UserRole,
        phone: userData.phone,
      },
    });
    createdTestUsers.push(created);
  }

  console.log('✅ Additional test users created:', createdTestUsers.map(u => u.email));

  // Create test addresses for new customers
  const testCustomers = createdTestUsers.filter(u => u.role === 'CUSTOMER');
  const testAddresses = [
    {
      userId: testCustomers[0]?.id,
      name: 'Ahmed Hassan',
      street: '45 Samora Avenue',
      city: 'Dar es Salaam',
      region: 'Dar es Salaam',
      zipCode: '11102',
      country: 'Tanzania',
      phone: '+255700555666',
      isDefault: true,
    },
    {
      userId: testCustomers[1]?.id,
      name: 'Grace Mwenda',
      street: '78 Uhuru Street',
      city: 'Dodoma',
      region: 'Dodoma',
      zipCode: '41101',
      country: 'Tanzania',
      phone: '+255700777888',
      isDefault: true,
    },
  ];

  for (const address of testAddresses) {
    if (address.userId) {
      const existingTestAddress = await prisma.address.findFirst({
        where: {
          userId: address.userId,
          isDefault: true,
        },
      });
      
      if (!existingTestAddress) {
        await prisma.address.create({
          data: address,
        });
      }
    }
  }

  console.log('✅ Test addresses created');

  // Create sample orders in different states for testing
  const testProducts = await prisma.product.findMany({ take: 3 });
  
  if (testProducts.length >= 3 && testCustomers.length >= 2) {
    const testOrders = [
      {
        userId: testCustomers[0].id,
        status: 'CONFIRMED' as OrderStatus,
        items: [
          { productId: testProducts[0].id, quantity: 2, price: testProducts[0].price },
          { productId: testProducts[1].id, quantity: 1, price: testProducts[1].price },
        ],
      },
      {
        userId: testCustomers[1].id,
        status: 'SHIPPED' as OrderStatus,
        items: [
          { productId: testProducts[1].id, quantity: 3, price: testProducts[1].price },
        ],
      },
      {
        userId: customer.id,
        status: 'DELIVERED' as OrderStatus,
        items: [
          { productId: testProducts[2].id, quantity: 1, price: testProducts[2].price },
        ],
      },
    ];

    for (const [index, orderData] of testOrders.entries()) {
      const subtotal = orderData.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
      const shippingCost = 3000;
      const total = subtotal + shippingCost;
      
      // Get the user's default address
      const userAddress = await prisma.address.findFirst({
        where: { userId: orderData.userId, isDefault: true },
      });
      
      if (!userAddress) continue;
      
      const orderNumber = `RMN${Date.now()}${index}`;
      const order = await prisma.order.create({
        data: {
          userId: orderData.userId,
          addressId: userAddress.id,
          orderNumber,
          qrCode: `https://romana-foods.vercel.app/orders/${orderNumber}`,
          trackingHash: `${orderNumber}_${Date.now()}`,
          status: orderData.status,
          paymentStatus: 'CONFIRMED' as PaymentStatus,
          subtotal,
          shippingCost,
          total,
          items: {
            create: orderData.items,
          },
        },
      });
    }

    console.log('✅ Test orders created with different statuses');
  }

  console.log('🎉 Database seeding completed successfully with delivery test data!');
  console.log('');
  console.log('📋 Test Account Summary:');
  console.log('  👤 Admin: admin@romana-natural-products.org (password: Romana2025!Admin$)');
  console.log('  🚚 Delivery: delivery@romana-natural-products.org (password: delivery123)');
  console.log('  🚚 Driver 1: driver1@romana.com (password: driver123)');
  console.log('  🚚 Driver 2: driver2@romana.com (password: driver123)');
  console.log('  🛒 Customer: customer@example.com (password: password)');
  console.log('  🛒 Test Customer 1: customer1@test.com (password: test123)');
  console.log('  🛒 Test Customer 2: customer2@test.com (password: test123)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 