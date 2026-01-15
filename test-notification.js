const admin = require('./config/firebase');


const registrationToken = 'dVl3zUSoBu5h0kq9tYDuPe:APA91bEQ2A3yCUyk8vDNcFxGFRuDM9hk6AA_U_8Gp-SPMf5YsG3la1avEA6gw65rCEi9jSye8IxY-KJGi3F_Z_nASRCR9dFG3k03YV4T4v_-3j46N8e948U';

const message = {
    notification: {
        title: 'Test Notification from Backend',
        body: 'If you see this, the connection is working!',
    },
    token: registrationToken
};

console.log("Attempting to send message...");

admin.messaging().send(message)
    .then((response) => {
        console.log('✅ Successfully sent message:', response);
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error sending message:', error);
        process.exit(1);
    });
