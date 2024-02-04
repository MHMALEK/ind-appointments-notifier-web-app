/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
// Scripts for firebase and firebase messaging
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

var firebaseConfig = {
    apiKey: "AIzaSyCsDRB7TLw2mrxp7znUsuQ-C2DjQtSPbL8",
    authDomain: "ind-application-af6db.firebaseapp.com",
    projectId: "ind-application-af6db",
    storageBucket: "ind-application-af6db.appspot.com",
    messagingSenderId: "419666471833",
    appId: "1:419666471833:web:7e9ceabf1d1025e5fac108",
    measurementId: "G-1Z7YXX4JT6",
  };
  

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
