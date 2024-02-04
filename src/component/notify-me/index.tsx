import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";

import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Alert,
  AlertTitle,
  Backdrop,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
} from "@mui/material";
import {
  fetchIndServicesAndDesksList,
  getAllNotificationsForMyUser,
  getSoonestAppointment,
  postIndNotifierRequest,
  removeAndUnsubscribeUser,
  removeNotification,
  sendPushNotificationToken,
} from "../api-calls.service";
import DatePicker from "../date-picker";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import signInToGoogle from "../google-signup";
import { getFirebaseMessagingInstance } from "../../firebase";
import { getToken } from "firebase/messaging";
import DeleteIcon from "@mui/icons-material/Delete";
import * as dayjs from "dayjs";

export const IND_DESKS_LABELS = {
  am: "Amsterdam",
  db: "Den Bosch",
  dh: "Den Haag",
  zw: "Zwolle",
  haarlem: "6b425ff9f87de136a36b813cccf26e23",
  "0588ef4088c08f53294eb60bab55c81e": "Expat center Eindhoven",
  b084907207cfeea941cd9698821fd894: "Expat center Wageningen",
  "3535aca0fb9a2e8e8015f768fb3fa69d": "Expat center Enschede",
  fa24ccf0acbc76a7793765937eaee440: "Expat center Utrecht",
};

export enum IND_SERVICES_LABELS {
  bio = "Biometrics",
  doc = "Collect residency documents",
  tkv = "Return visa",
  vaa = "Residence endorsment sticker",
}

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
});

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const steps = ["Service", "Date", "How to notify me"];

function requestPushNotificationToken() {
  const messaging = getFirebaseMessagingInstance();

  const getTokenAndPermission = () => {
    return new Promise((resolve, reject) => {
      getToken(messaging, {
        vapidKey:
          "BC1VSteKpIdnoLuwxiHiQri-CeLlIzsZJ3BG_xTWchySPXK7FEWshezIi08tfFmp5kvY6Ay58jCkFbbLLRKxei8",
      })
        .then((currentToken) => {
          if (currentToken) {
            resolve(currentToken);
          } else if (Notification.permission === "denied") {
            console.log(
              "Permission for notifications has been denied by the user."
            );
            reject("Permission denied");
          } else {
            console.log(
              "No registration token available. Request permission to generate one."
            );
            reject("Permission required");
          }
        })
        .catch((err) => {
          console.log("An error occurred while retrieving token. ", err);
          reject("Error occurred");
        });
    });
  };

  return getTokenAndPermission();
}

export default function NotifyMeComponent() {
  const [selectedService, setSelectedService] = React.useState("");
  const [selectedDesk, setSelectedDesk] = React.useState("");
  const [desks, setDesks] = React.useState<any>([]);
  const [desksAndServices, setDesksAndServices] = React.useState<any>({});
  const [servicesForm, setServicesForm] = React.useState([]);
  const [deskForm, setDeskForm] = React.useState([]);
  const [soonestAppointmentData, setSoonestAppointmentData] =
    React.useState<any>(null);
  const [loadingForAppointment, setLoadingForAppointment] =
    React.useState(false);
  const [dialogSuccessOpen, setDialogSuccessOpen] = React.useState(false);
  const [dialogErrorOpen, setDialogErrorOpen] = React.useState(false);
  const [errorDesk, setErrorDesk] = React.useState<string | null>(null);

  const [activeStep, setActiveStep] = React.useState(0);

  const [selectedDate, setSelectedDate] = React.useState<any>(null);
  const [loadingCreate, setLoadingCreate] = React.useState<boolean>(false);

  const [loadingRemoveNotification, setLoadingRemoveNotification] =
    React.useState<boolean>(false);

  const [selectedNotificationType, setSelectedNotificationType] =
    React.useState("email");

  const auth = getAuth();
  const [user, setUser] = React.useState<any>(null);

  const [myNotifications, setMyNotifications] = React.useState<any>([]);
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log(currentUser);
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    // Unsubscribe from the onAuthStateChanged listener on component unmount
    return () => unsubscribe();
  }, [auth]);

  React.useEffect(() => {
    if (user) {
      auth.currentUser
        .getIdToken(/* forceRefresh */ true)
        .then(function (idToken) {
          getAllNotificationsForMyUser(user.uid, idToken)
            .then((res) => {
              console.log(res);
              setMyNotifications(res);
            })
            .catch((e) => {
              console.log(e);
            });
        });
    }
  }, [user]);

  function handleSubmit(event: any) {
    event.preventDefault();
    signInToGoogle();
  }

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {},
  });

  React.useEffect(() => {
    fetchIndServicesAndDesksList().then(({ servicesByDesks, desks }) => {
      setDesksAndServices(servicesByDesks);
      setServicesForm(Object.values(servicesByDesks));
      setDesks(desks);
    });
  }, []);

  const getDesksForSelectedService = (service: string) => {
    setDeskForm(desksAndServices[service].desks);
  };

  const handleServiceChange = (event: SelectChangeEvent) => {
    setSelectedDesk("");
    setSelectedService(event.target.value as string);
    getDesksForSelectedService(event.target.value as string);
  };
  const handleDeskChange = async (event: SelectChangeEvent) => {
    setDialogOpen(true);
    setSelectedDesk(event.target.value as string);
    setLoadingForAppointment(true);
    try {
      const { data } = await getSoonestAppointment(
        selectedService,
        event.target.value
      );
      setSoonestAppointmentData(data);
    } catch (e) {
      throw new Error("asd");
    } finally {
      setLoadingForAppointment(false);
    }
  };

  const shouldDisableButton = () => {
    if (!selectedDesk || !selectedService) {
      return true;
    }
    return false;
  };

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleSelectNotificationChange = (e: any) => {
    setSelectedNotificationType(e.target.value);
  };

  React.useEffect(() => {
    if (selectedNotificationType === "push_notification") {
      requestPushNotificationToken()
        .then((token: string) => {
          console.log(token);
          setRejected(false);
          const user = getAuth().currentUser;
          if (!user) {
            throw new Error("User is not signed in");
          } else {
            sendPushNotificationToken(token, user.uid, user.email);
          }
        })
        .catch((e) => {
          console.log(e);
          setRejected(true);
        });
    }
  }, [selectedNotificationType]);

  const handleCreateNotifierRequest = async () => {
    if (selectedNotificationType === "telegram_bot") {
      return window.open("https://t.me/ind_appointment_notifier_bot", "_blank");
    }
    if (user) {
      const payload = {
        firebase_user_id: user.uid,
        pushToken: "",
        desk: selectedDesk,
        service: selectedService,
        date: selectedDate,
        prefered_way_of_communication: selectedNotificationType,
      };
      auth.currentUser
        .getIdToken(/* forceRefresh */ true)
        .then(function (idToken) {
          setLoadingCreate(true);
          console.log(idToken);
          postIndNotifierRequest(payload, idToken)
            .then((res) => {
              setDialogSuccessOpen(true);
            })
            .catch((e) => {
              console.log(e);
              setDialogErrorOpen(true);
              if (
                e.statusCode === 400 &&
                e.message.includes("email is not verified")
              ) {
                setErrorDesk(
                  "There was an error. please try again or contact support"
                );
              }
            })
            .finally(() => setLoadingCreate(false));
        })
        .catch(function (error) {
          toggleShowSignInDialog();
        });
    } else {
      toggleShowSignInDialog();
    }
  };

  const [showSignInDialog, setShowSignInDialog] = React.useState(false);

  const toggleShowSignInDialog = () => {
    setShowSignInDialog(!showSignInDialog);
  };
  const onDateChange = (value: string) => {
    setSelectedDate(value);
  };

  const handleCloseSuccessDialog = () => {
    setActiveStep(0);
    setSelectedDate(null);
    setSelectedDesk("");
    setSelectedService("");
    setDialogSuccessOpen(false);
    setDialogErrorOpen(false);
    setDialogOpen(false);
    if (user) {
      auth.currentUser
        .getIdToken(/* forceRefresh */ true)
        .then(function (idToken) {
          getAllNotificationsForMyUser(user.uid, idToken)
            .then((res) => {
              console.log(res);
              setMyNotifications(res);
            })
            .catch((e) => {
              console.log(e);
            });
        });
    }
  };

  const handleCloseErrorDialog = () => {
    setDialogErrorOpen(false);
    setErrorDesk(null);
  };

  const handleRemoveReminder = async (notificationId) => {
    setLoadingRemoveNotification(true);
    await removeNotification(notificationId);
    setLoadingRemoveNotification(false);
    if (user) {
      auth.currentUser
        .getIdToken(/* forceRefresh */ true)
        .then(function (idToken) {
          getAllNotificationsForMyUser(user.uid, idToken)
            .then((res) => {
              console.log(res);
              setMyNotifications(res);
            })
            .catch((e) => {
              console.log(e);
            });
        });
    }
  };

  const handleRemoveUserAndNotifications = async (notificationId) => {
    setLoadingRemoveNotification(true);
    await removeAndUnsubscribeUser(notificationId);
    setLoadingRemoveNotification(false);
    setUser(null);
    setMyNotifications(null);
  };

  function getStepContent(step: number) {
    switch (step) {
      case 0:
        return (
          <>
            <Typography
              fontSize={13}
              sx={{ px: 1, textAlign: "left", mb: 4, mt: 0 }}
            >
              To start, Please select a service and a desk that you want to get
              notified about.
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">
                Select service
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="select-service-select"
                value={selectedService}
                label="Select service"
                onChange={handleServiceChange}
                sx={{ mb: 2 }}
              >
                {servicesForm.map((service: any) => {
                  return (
                    <MenuItem key={service.code} value={service.code}>
                      {capitalizeFirstLetter(service.label)}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl fullWidth disabled={!selectedService}>
              <InputLabel id="demo-simple-select-label">Select desk</InputLabel>
              <Select
                labelId="select-desk-select"
                id="select-desk"
                value={selectedDesk}
                label="Select desk"
                onChange={handleDeskChange}
              >
                {deskForm.map((desk: any) => {
                  return (
                    <MenuItem key={desk.code} value={desk.code}>
                      {capitalizeFirstLetter(desk.label)}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <Dialog
              open={dialogOpen}
              onClose={handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <div style={{ textAlign: "center" }}>
                <img
                  src="./soonest.jpg"
                  alt="soonest-appointment-available"
                  style={{ width: "350px", padding: 30, maxWidth: "100%" }}
                ></img>
              </div>

              <DialogTitle id="alert-dialog-title">
                Soonest available slot
              </DialogTitle>
              {loadingForAppointment ? (
                <CircularProgress color="inherit" />
              ) : soonestAppointmentData ? (
                <>
                  <DialogContent>
                    <Typography fontSize={15} fontWeight="bold">
                      {" "}
                      There is an slot available at{" "}
                      {soonestAppointmentData.date} from{" "}
                      {soonestAppointmentData.startTime} to{" "}
                      {soonestAppointmentData.endTime}
                    </Typography>
                    <Typography fontSize={13}>
                      Do you need to be notified when a sooner slot became
                      available?
                    </Typography>
                    <Typography fontSize={13}>
                      Go to Next step and select a date!
                    </Typography>
                  </DialogContent>
                  <DialogActions sx={{ py: 3 }}>
                    <Button onClick={handleClose}>Close</Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                    >
                      Next - Choose a date
                    </Button>
                  </DialogActions>
                </>
              ) : (
                <>
                  <DialogContent>
                    <Typography fontSize={13}>
                      We couldn't find any slot! Please go to IND website
                      directly.
                    </Typography>
                  </DialogContent>
                  <DialogActions sx={{ py: 3 }}>
                    <Button onClick={handleClose}>Close</Button>
                  </DialogActions>
                </>
              )}
            </Dialog>

            {user ? (
              <Box sx={{ mx: "auto", textAlign: "center", mt: 8 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!selectedDesk || !selectedService}
                >
                  Next - choose a date
                </Button>
              </Box>
            ) : (
              <Box sx={{ mx: "auto", textAlign: "center", mt: 4 }}>
                <button
                  onClick={handleSubmit}
                  className="login-with-google-btn"
                >
                  Sign in with Google to continue
                </button>
              </Box>
            )}
          </>
        );
      case 1:
        return (
          <>
            <Alert severity="info" sx={{ mt: 0, mb: 2, mx: "auto" }}>
              <AlertTitle>
                {" "}
                You've selected{" "}
                {capitalizeFirstLetter(
                  desksAndServices[selectedService].label
                )}{" "}
                for {capitalizeFirstLetter(desks[selectedDesk])}
              </AlertTitle>
            </Alert>

            <Typography sx={{ mb: 3, px: 1, textAlign: "left" }}>
              Select a date that you want to be notified if a sooner slot became
              available
            </Typography>

            <DatePicker onDateChange={onDateChange} />

            <Box sx={{ mx: "auto", textAlign: "center", mt: 2 }}>
              <Button variant="outlined" onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>

              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!selectedDesk || !selectedService}
              >
                Next
              </Button>
            </Box>
          </>
        );
      case 2:
        return (
          <>
            <>
              <FormControl>
                <Typography sx={{ mb: 1, textAlign: "left" }}>
                  Please choose how you want to be notified.
                </Typography>
                <img
                  src="/2892359.jpg"
                  style={{
                    maxWidth: "100%",
                  }}
                  alt="notify-me"
                />
                <Typography
                  sx={{
                    mb: 3,
                    textAlign: "left",
                    fontWeight: "bold",
                    fontSize: 13,
                  }}
                >
                  By using this service, you agree to receive daily email or
                  push and saving your email and your data on our database.
                </Typography>
                <RadioGroup
                  onChange={handleSelectNotificationChange}
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue={selectedNotificationType}
                  name="radio-buttons-group"
                >
                  <FormControlLabel
                    value="email"
                    control={<Radio />}
                    label="Email"
                  />
                  <FormControlLabel
                    value="push_notification"
                    control={<Radio />}
                    label="Push Notification (only on supported devices and browsers)."
                  />
                  <FormControlLabel
                    value="telegram_bot"
                    control={<Radio />}
                    label="Telegram Bot (You need to use telegram bot) "
                  />
                </RadioGroup>
              </FormControl>

              {selectedNotificationType === "email" ? (
                <>
                  <Alert severity="warning" sx={{ mt: 2, textAlign: "left" }}>
                    We will send you to the email that you signed in with every
                    day{" "}
                  </Alert>
                </>
              ) : selectedNotificationType === "push_notification" ? (
                <Alert severity="warning" sx={{ mt: 2, textAlign: "left" }}>
                  You need to allow Push notification from our website.
                  <a href="https://www.cleanfox.io/blog/tips-en/how-to-enable-push-notifications-on-chrome-firefox-and-safari-browsers/">
                    How to do that?
                  </a>
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mt: 2, textAlign: "left" }}>
                  You need to start our telegram bot and go through flow.
                  <a href="https://www.cleanfox.io/blog/tips-en/how-to-enable-push-notifications-on-chrome-firefox-and-safari-browsers/">
                    Telegram bot
                  </a>
                </Alert>
              )}

              <Box sx={{ mx: "auto" }}>
                <Button variant="outlined" onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={shouldDisableButton()}
                  sx={{ my: 4 }}
                  onClick={handleCreateNotifierRequest}
                >
                  {selectedNotificationType === "telegram_bot"
                    ? "Open telegram bot"
                    : "Notify me!"}
                </Button>
              </Box>

              <Backdrop
                sx={{
                  color: "#fff",
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={loadingCreate || loadingRemoveNotification}
                //   onClick={handleClose}
              >
                <CircularProgress color="inherit" />
              </Backdrop>

              <Dialog
                open={dialogSuccessOpen}
                onClose={handleCloseSuccessDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <img
                  alt="success"
                  src="./soonest.jpg"
                  style={{
                    width: "400px",
                    margin: "0 auto 0 auto",
                    maxWidth: "100%",
                    padding: 30,
                    paddingBottom: 0,
                  }}
                />

                <DialogTitle id="alert-dialog-title">Congrats!</DialogTitle>
                <DialogContent>
                  {loadingForAppointment ? (
                    <CircularProgress color="inherit" />
                  ) : (
                    <>
                      <Typography fontSize={15}>
                        You've created a notifier! We will check IND
                        appointments every day and will notify you if a new slot
                        became available.
                      </Typography>
                    </>
                  )}
                </DialogContent>

                <DialogActions>
                  <Button onClick={handleCloseSuccessDialog}>Close</Button>
                </DialogActions>
              </Dialog>

              <Dialog
                open={dialogErrorOpen}
                onClose={handleCloseErrorDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">Error</DialogTitle>
                <DialogContent>
                  {loadingForAppointment ? (
                    <CircularProgress color="inherit" />
                  ) : (
                    <>
                      <Typography fontSize={15}>
                        {errorDesk ||
                          "Something went wrong! Please try again and if issue still exist, contact us via mhos.malek@gmail.com"}
                      </Typography>
                    </>
                  )}
                </DialogContent>

                <DialogActions>
                  <Button onClick={handleCloseErrorDialog}>Close</Button>
                </DialogActions>
              </Dialog>
            </>
          </>
        );
      default:
        throw new Error("Unknown step");
    }
  }

  const [isRejected, setRejected] = React.useState(false);

  return (
    <>
      <CssBaseline />
      <Snackbar
        open={isRejected}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={3000}
      >
        <Alert severity="warning">
          The notification for this app is blocked or not been granted yet. If
          you don't allow the notification, you will not be able to receive any
          notification.
        </Alert>
      </Snackbar>

      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 2 }, p: { xs: 2, md: 3 } }}
      >
        <Box
          sx={{
            marginTop: 2,
            textAlign: "left",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <img
              src="/3908417.jpg"
              style={{
                maxWidth: "100%",
                width: "80%",
                margin: "0 auto",
                textAlign: "center",
              }}
              alt="notify-me"
            />
          </div>

          <Typography
            fontSize={20}
            fontWeight="bold"
            sx={{
              marginBottom: 2,
            }}
          >
            What is this app?
          </Typography>

          <Typography fontSize={14}>
            Ever happened to you that you want to book an appointment at IND but
            the next available appointment is in 3 months? This app will help
            you to find out about the soonest available appointment.
          </Typography>
          <Typography fontSize={14}>
            We will check IND appointments every day and will notify you if a
            new slot became available.
          </Typography>
        </Box>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 2 }, p: { xs: 2, md: 3 } }}
      >
        <Box
          sx={{
            marginTop: 2,
          }}
        >
          <>
            <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <React.Fragment>{getStepContent(activeStep)}</React.Fragment>
          </>
        </Box>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 2 }, p: { xs: 2, md: 3 }, textAlign: "center" }}
      >
        <Box>
          <Typography
            style={{
              width: "100%",
              fontWeight: "bold",
              textAlign: "left",
            }}
            sx={{
              mb: 3,
            }}
          >
            My Profile:
          </Typography>

          <img
            alt="reminders"
            src="./my-reminders.jpeg"
            style={{
              width: "400px",
              margin: "0 auto 30px auto",
              maxWidth: "100%",
            }}
          />
          {user ? (
            <>
              <button
                type="button"
                onClick={handleSubmit}
                className="login-with-google-btn"
              >
                Signed in as {user.email}
              </button>
              <Button
                sx={{ ml: 1 }}
                variant="contained"
                color="error"
                onClick={() => handleRemoveUserAndNotifications(user.uid)}
              >
                Remove My Profile
              </Button>
            </>
          ) : (
            <>
              <button onClick={handleSubmit} className="login-with-google-btn">
                Sign in with Google
              </button>
            </>
          )}
        </Box>

        <Box sx={{ mt: 4, mb: 1, textAlign: "left" }}>
          <Typography
            style={{
              width: "100%",
              fontWeight: "bold",
            }}
            sx={{
              mb: 3,
            }}
          >
            My Reminders:
          </Typography>

          {myNotifications.length > 0 ? (
            <List dense={false}>
              {myNotifications.map((notification: any, index: number) => (
                <React.Fragment key={index}>
                  <ListItem
                    secondaryAction={
                      <IconButton
                        onClick={() => handleRemoveReminder(notification._id)}
                        edge="end"
                        aria-label="delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={`Reminder for ${
                        IND_SERVICES_LABELS[notification.service]
                      } at ${
                        IND_DESKS_LABELS[notification.desk]
                      }, anytime before ${dayjs
                        .unix(notification.date)
                        .format("DD/MM/YYYY")}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography
              sx={{
                mb: 3,
              }}
            >
              You don't have any reminder yet!
            </Typography>
          )}
        </Box>
      </Paper>
    </>
  );
}
