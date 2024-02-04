import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { Messaging, getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCsDRB7TLw2mrxp7znUsuQ-C2DjQtSPbL8",
  authDomain: "ind-application-af6db.firebaseapp.com",
  projectId: "ind-application-af6db",
  storageBucket: "ind-application-af6db.appspot.com",
  messagingSenderId: "419666471833",
  appId: "1:419666471833:web:7e9ceabf1d1025e5fac108",
  measurementId: "G-1Z7YXX4JT6",
};

// Initialize Firebase Cloud Messaging and get a reference to the service

let app: FirebaseApp;
let messaging: Messaging;

const initFireBaseApp = () => {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  const auth = getAuth(app);
  const messaging = getMessaging(app);

  return {
    app,
    auth,
    messaging,
  };
};
const getFireBase = () => {
  return app ?? initFireBaseApp();
};

const getFirebaseMessagingInstance = () => {
  return messaging ?? initFireBaseApp().messaging;
};

export { getFireBase, getFirebaseMessagingInstance };
