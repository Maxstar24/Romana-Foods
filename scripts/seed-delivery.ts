import { prisma } from '../src/lib/prisma';

async function seedDeliveryRegions() {
  console.log('🌱 Seeding delivery regions...');

  // Define delivery regions and subregions for Tanzania
  const regions = [
    {
      name: 'Dar es Salaam',
      subregions: [
        { name: 'Ilala District', deliveryFee: 2000 },
        { name: 'Kinondoni District', deliveryFee: 2500 },
        { name: 'Temeke District', deliveryFee: 3000 },
        { name: 'Ubungo District', deliveryFee: 2500 },
        { name: 'Kigamboni District', deliveryFee: 4000 },
      ],
    },
    {
      name: 'Arusha',
      subregions: [
        { name: 'Arusha City Center', deliveryFee: 3000 },
        { name: 'Tengeru', deliveryFee: 4000 },
        { name: 'Usa River', deliveryFee: 5000 },
        { name: 'Njiro', deliveryFee: 3500 },
        { name: 'Kijenge', deliveryFee: 3500 },
      ],
    },
    {
      name: 'Mwanza',
      subregions: [
        { name: 'Nyamagana District', deliveryFee: 4000 },
        { name: 'Ilemela District', deliveryFee: 4500 },
        { name: 'Buzuruga', deliveryFee: 5000 },
        { name: 'Pamba', deliveryFee: 5500 },
      ],
    },
    {
      name: 'Dodoma',
      subregions: [
        { name: 'Dodoma Urban', deliveryFee: 3500 },
        { name: 'Chamwino', deliveryFee: 4500 },
        { name: 'Bahi', deliveryFee: 6000 },
      ],
    },
    {
      name: 'Mbeya',
      subregions: [
        { name: 'Mbeya City', deliveryFee: 4000 },
        { name: 'Iyunga', deliveryFee: 5000 },
        { name: 'Ruanda', deliveryFee: 5500 },
      ],
    },
    {
      name: 'Tanga',
      subregions: [
        { name: 'Tanga City', deliveryFee: 3500 },
        { name: 'Muheza', deliveryFee: 4500 },
        { name: 'Pangani', deliveryFee: 5000 },
      ],
    },
    {
      name: 'Morogoro',
      subregions: [
        { name: 'Morogoro Municipal', deliveryFee: 3500 },
        { name: 'Kilosa', deliveryFee: 5000 },
        { name: 'Mvomero', deliveryFee: 4500 },
      ],
    },
  ];

  for (const regionData of regions) {
    console.log(`Creating region: ${regionData.name}`);
    
    const region = await (prisma as any).deliveryRegion.create({
      data: {
        name: regionData.name,
        isActive: true,
      },
    });

    for (const subregionData of regionData.subregions) {
      console.log(`  Creating subregion: ${subregionData.name} - TZS ${subregionData.deliveryFee}`);
      
      await (prisma as any).deliverySubregion.create({
        data: {
          name: subregionData.name,
          deliveryFee: subregionData.deliveryFee,
          regionId: region.id,
          isActive: true,
        },
      });
    }
  }
}

async function seedCategories() {
  console.log('🌱 Seeding product categories...');

  const categories = [
    {
      name: 'Organic Juices',
      slug: 'organic-juices',
      description: 'Fresh and natural organic fruit juices made from locally sourced ingredients',
      image: '/images/categories/juices.jpg',
      sortOrder: 1,
    },
    {
      name: 'Natural Snacks',
      slug: 'natural-snacks',
      description: 'Healthy and delicious snacks made from natural ingredients',
      image: '/images/categories/snacks.jpg',
      sortOrder: 2,
    },
    {
      name: 'Herbal Teas',
      slug: 'herbal-teas',
      description: 'Premium herbal teas and traditional blends for wellness',
      image: '/images/categories/teas.jpg',
      sortOrder: 3,
    },
    {
      name: 'Fresh Fruits',
      slug: 'fresh-fruits',
      description: 'Seasonal fresh fruits directly from local farms',
      image: '/images/categories/fruits.jpg',
      sortOrder: 4,
    },
    {
      name: 'Vegetables',
      slug: 'vegetables',
      description: 'Organic and fresh vegetables for healthy living',
      image: '/images/categories/vegetables.jpg',
      sortOrder: 5,
    },
    {
      name: 'Honey & Sweeteners',
      slug: 'honey-sweeteners',
      description: 'Natural honey and organic sweeteners',
      image: '/images/categories/honey.jpg',
      sortOrder: 6,
    },
  ];

  for (const categoryData of categories) {
    console.log(`Creating category: ${categoryData.name}`);
    
    await prisma.category.create({
      data: {
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        image: categoryData.image,
        isActive: true,
        sortOrder: categoryData.sortOrder,
      },
    });
  }
}

async function main() {
  try {
    console.log('🚀 Starting to seed the database...');
    
    // Check if regions already exist
    const existingRegions = await (prisma as any).deliveryRegion.count();
    if (existingRegions === 0) {
      await seedDeliveryRegions();
      console.log('✅ Delivery regions seeded successfully!');
    } else {
      console.log('⏭️  Delivery regions already exist, skipping...');
    }

    // Check if categories already exist
    const existingCategories = await prisma.category.count();
    if (existingCategories === 0) {
      await seedCategories();
      console.log('✅ Categories seeded successfully!');
    } else {
      console.log('⏭️  Categories already exist, skipping...');
    }

    console.log('🎉 Database seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default main;
