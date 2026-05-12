#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// This script helps you encode your service account key for Railway deployment
// Usage: node scripts/encode-service-key.js

const keyPath = path.join(__dirname, '../server/credentials/service-account-key.json');

try {
  // Check if the key file exists
  if (!fs.existsSync(keyPath)) {
    console.error('❌ Service account key file not found at:', keyPath);
    console.log('\n📝 Please follow these steps:');
    console.log('1. Create a service account in Google Cloud Console');
    console.log('2. Download the JSON key file');
    console.log('3. Place it at: server/credentials/service-account-key.json');
    console.log('4. Run this script again');
    process.exit(1);
  }

  // Read and encode the key file
  const keyData = fs.readFileSync(keyPath, 'utf8');
  const base64Key = Buffer.from(keyData).toString('base64');

  console.log('✅ Service account key file found and encoded successfully!');
  console.log('\n🔧 Add this environment variable to your Railway project:');
  console.log('\n' + '='.repeat(60));
  console.log('GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=' + base64Key);
  console.log('='.repeat(60));
  
  console.log('\n📋 Additional environment variables needed:');
  console.log('GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id');
  
  console.log('\n🚀 Next steps:');
  console.log('1. Copy the base64 string above');
  console.log('2. Go to your Railway project settings');
  console.log('3. Add the environment variable');
  console.log('4. Add your Google Drive folder ID');
  console.log('5. Redeploy your application');
  
  console.log('\n💡 Tip: You can also save this to a file for later use:');
  console.log('echo "GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=' + base64Key + '" > railway-env.txt');

} catch (error) {
  console.error('❌ Error reading service account key:', error.message);
  process.exit(1);
}
