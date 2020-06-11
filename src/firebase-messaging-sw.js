// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/5.7.3/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.7.3/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
    messagingSenderId: '133495277331'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(payload => {
    const data = payload.data

    const notificationTitle = data.title;
    const notificationOptions = {
        body: data.body,
        icon: data.icon,
        badge: data.icon,
        color: data.color,
        priority: data.priority,
        data: `${self.location.origin}/notification/${data.record_id}`,
        image: data.image
    };

    if (data.type === 'new message')
        notificationOptions.data = `${self.location.origin}/attendance`

    return self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(self.clients.openWindow(event.notification.data));
});