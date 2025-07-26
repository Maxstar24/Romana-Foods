#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function testBase64Upload() {
  try {
    console.log('🧪 Testing Base64 Image Conversion...\n');
    
    // Find a test image in the public folder
    const productsDir = path.join(process.cwd(), 'public', 'images', 'products');
    const testImagePath = path.join(productsDir, 'child.jpeg');
    
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ Test image not found at:', testImagePath);
      return;
    }
    
    // Read and convert to base64
    const imageBuffer = fs.readFileSync(testImagePath);
    const base64 = imageBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    
    console.log('✅ Successfully converted image to base64!');
    console.log('📊 Image Stats:');
    console.log(`   File Size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`   Base64 Size: ${(base64.length / 1024).toFixed(2)} KB`);
    console.log(`   Data URL Length: ${dataUrl.length} characters`);
    console.log(`   Data URL Preview: ${dataUrl.substring(0, 100)}...`);
    
    // Write sample to file for testing
    const samplePath = path.join(process.cwd(), 'scripts', 'sample-base64.txt');
    fs.writeFileSync(samplePath, dataUrl);
    console.log(`\n💾 Sample base64 data URL saved to: ${samplePath}`);
    console.log('\n🎉 Base64 conversion is working! Your upload API should now work with PostgreSQL storage.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testBase64Upload();
