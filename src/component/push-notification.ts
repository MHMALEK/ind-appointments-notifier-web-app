import { useEffect, useState } from "react";
import { getFirebaseMessagingInstance } from "../firebase";
import { getToken, onMessage } from "firebase/messaging";

export const useTokenFromUser = () => {
  const [isTokenFound, setTokenFound] = useState(false);
  const [token, setToken] = useState(undefined);

  useEffect(() => {
    const messaging = getFirebaseMessagingInstance();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received. ", payload);
      // ...
    });

    getToken(messaging, {
      vapidKey:
        "BC1VSteKpIdnoLuwxiHiQri-CeLlIzsZJ3BG_xTWchySPXK7FEWshezIi08tfFmp5kvY6Ay58jCkFbbLLRKxei8",
    })
      .then((currentToken) => {
        if (currentToken) {
          setTokenFound(true);
          setToken(currentToken);
        } else if (Notification.permission === "denied") {
          console.log(
            "Permission for notifications has been denied by the user."
          );
          setTokenFound(false);
          // shows on the UI that permission is denied
        } else {
          console.log(
            "No registration token available. Request permission to generate one."
          );
          setTokenFound(false);
          // shows on the UI that permission is required
        }
      })
      .catch((err) => {
        console.log("An error occurred while retrieving token. ", err);
        // catch error while creating client token
      });

    return () => {
      unsubscribe();
    };
  }, []);

  return { token, isTokenFound };
};
