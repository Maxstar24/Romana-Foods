#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCategories() {
  try {
    console.log('🔍 Checking existing categories...');
    
    const existingCategories = await prisma.category.findMany();
    console.log(`Found ${existingCategories.length} existing categories:`);
    existingCategories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat.id})`);
    });

    if (existingCategories.length === 0) {
      console.log('\n📦 No categories found. Creating default categories...');
      
      const defaultCategories = [
        {
          name: 'Grains & Cereals',
          slug: 'grains-cereals',
          description: 'Natural grains and cereal products',
          sortOrder: 1,
        },
        {
          name: 'Spices & Herbs',
          slug: 'spices-herbs', 
          description: 'Fresh and dried spices and herbs',
          sortOrder: 2,
        },
        {
          name: 'Oils & Vinegars',
          slug: 'oils-vinegars',
          description: 'Natural oils and vinegars',
          sortOrder: 3,
        },
        {
          name: 'Snacks & Treats',
          slug: 'snacks-treats',
          description: 'Healthy snacks and natural treats',
          sortOrder: 4,
        },
        {
          name: 'Beverages',
          slug: 'beverages',
          description: 'Natural drinks and teas',
          sortOrder: 5,
        },
      ];

      for (const category of defaultCategories) {
        const created = await prisma.category.create({
          data: category,
        });
        console.log(`  ✅ Created: ${created.name} (ID: ${created.id})`);
      }
      
      console.log('\n🎉 Default categories created successfully!');
    } else {
      console.log('\n✅ Categories already exist. No need to seed.');
    }

    console.log('\n📋 Current categories for product creation:');
    const allCategories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    
    allCategories.forEach(cat => {
      console.log(`  ID: ${cat.id} | Name: ${cat.name} | Slug: ${cat.slug}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();
