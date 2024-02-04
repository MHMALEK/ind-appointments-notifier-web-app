import React, { useState } from "react";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import { getFirebaseMessagingInstance } from "./firebase";
import { MessagePayload, onMessage } from "firebase/messaging";
import { Alert, Snackbar } from "@mui/material";

const messaging = getFirebaseMessagingInstance();

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

function App() {
  const [show, setShow] = useState(false);
  const [notification, setNotification] = useState({ title: "", body: "" });

  onMessageListener()
    .then((payload: MessagePayload) => {
      setShow(true);
      setNotification({
        title: payload.notification.title,
        body: payload.notification.body,
      });
    })
    .catch((err) => console.log("failed: ", err));

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setShow(false);
  };

  return (
    <div>
      <Snackbar
        open={show}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity="info"
          variant="filled"
          sx={{ width: "100%" }}
        >
          <h3>{notification.title}</h3>
          <p dangerouslySetInnerHTML={{ __html: notification.body }}></p>
        </Alert>
      </Snackbar>
      <Dashboard />
    </div>
  );
}

export default App;
