// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
// Replace 10.13.2 with latest version of the Firebase JS SDK.
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyCz4FjXCsmejAPPVqXNMGdi8XJRbN8fzNY",
  authDomain: "push-notificatioon.firebaseapp.com",
  projectId: "push-notificatioon",
  storageBucket: "push-notificatioon.firebasestorage.app",
  messagingSenderId: "402097053306",
  appId: "1:402097053306:web:5b3da07d4dbbfedbde25c3",
  measurementId: "G-8J7VZ7W71J"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(async (payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  // Customize notification here

  await fetch(`${self.location.origin}/api/saveNotification`,{
    method: 'POST',
    headers:{
        'Content-Type':'application/json'
    },
    body:JSON.stringify({
        title: payload.notification.title,
        body: payload.notification.body,
        icon: payload.notification.icon ?? null,
        image: payload.notification.image ?? null
    })
  })
  
//   self.registration.showNotification(notificationTitle, notificationOptions);
});