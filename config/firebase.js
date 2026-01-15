const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');

try {
    // Check if the service account file exists and has content
    const serviceAccount = require(serviceAccountPath);

    if (!serviceAccount.project_id || serviceAccount.project_id === 'your-project-id') {
        console.warn('⚠️ Firebase service account file seems to be using placeholder data. Firebase Admin not initialized.');
    } else {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin initialized successfully');
    }
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    console.error('   Make sure backend/firebase-service-account.json exists and is valid.');
}

module.exports = admin;
