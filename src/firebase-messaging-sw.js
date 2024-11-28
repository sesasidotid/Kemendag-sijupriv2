importScripts(
    'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js',
);
importScripts(
    'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js',
);

firebase.initializeApp({
    apiKey: "AIzaSyBHvB-ce9lpJdWbDJCBP2XLVJHYzV62oLw",
    authDomain: "sijupri.firebaseapp.com",
    projectId: "sijupri",
    storageBucket: "sijupri.firebasestorage.app",
    messagingSenderId: "152999394823",
    appId: "1:152999394823:web:7fe12972842c413c2e34a2",
    measurementId: "G-87JRW9M02W",
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    // Customize notification
    const notificationTitle = payload.notification.title || 'Background Notification';
    const notificationOptions = {
        body: payload.notification.body,
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});
