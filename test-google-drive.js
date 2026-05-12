// Test script for Google Drive integration with Firebase auth
// Run this in your browser console or as a simple HTML page

const testGoogleDriveIntegration = async () => {
  try {
    // Get Firebase ID token
    const user = firebase.auth().currentUser;
    if (!user) {
      console.error('Please sign in first');
      return;
    }

    const idToken = await user.getIdToken();
    console.log('Firebase ID Token:', idToken.substring(0, 20) + '...');

    // Test 1: Check Google Drive availability
    console.log('\n=== Testing Google Drive Endpoint ===');
    const driveResponse = await fetch('https://eduhub-production-c198.up.railway.app/api/google-drive/', {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (driveResponse.ok) {
      const driveData = await driveResponse.json();
      console.log('✅ Google Drive endpoint working:', driveData);
    } else {
      console.error('❌ Google Drive endpoint error:', await driveResponse.text());
    }

    // Test 2: Test file upload
    console.log('\n=== Testing File Upload ===');
    
    // Create a test file
    const testFile = new Blob(['Hello Google Drive!'], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', testFile, 'test.txt');
    formData.append('useGoogleDrive', 'true');

    const uploadResponse = await fetch('https://eduhub-production-c198.up.railway.app/api/uploads/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`
      },
      body: formData
    });

    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      console.log('✅ Upload successful:', uploadData);
    } else {
      console.error('❌ Upload failed:', await uploadResponse.text());
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Instructions:
// 1. Sign in to your EduHub app
// 2. Open browser console (F12)
// 3. Copy and paste this function
// 4. Run: testGoogleDriveIntegration()

console.log(`
🧪 Google Drive Integration Test Script

To test your Google Drive integration:

1. Make sure you're signed into your EduHub app
2. Open browser console (F12)
3. Copy and paste the testGoogleDriveIntegration function
4. Run: testGoogleDriveIntegration()

This will test:
- Google Drive endpoint availability
- File upload to Google Drive
- Firebase authentication

Make sure you've added these environment variables to Railway:
- GOOGLE_SERVICE_ACCOUNT_KEY_BASE64
- GOOGLE_DRIVE_FOLDER_ID
`);
