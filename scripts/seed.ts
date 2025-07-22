import { PrismaClient } from '@prisma/client';
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

  console.log('✅ Users created:', { admin: admin.email, customer: customer.email });

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
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 