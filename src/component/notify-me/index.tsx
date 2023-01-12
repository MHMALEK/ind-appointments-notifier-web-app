import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import QueryStatsIcon from "@mui/icons-material/QueryStatsOutlined";
import TelegramIcon from "@mui/icons-material/Telegram";

import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Alert,
  AlertTitle,
  Backdrop,
  ButtonGroup,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Step,
  StepLabel,
  Stepper,
} from "@mui/material";
import {
  fetchIndServicesAndDesksList,
  getSoonestAppointment,
  getSoonestAppointmentsForAllDesksAndServices,
  postIndNotifierRequest,
  postIndNotifierRequestEmail,
} from "../api-calls.service";
import DatePicker from "../date-picker";

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
});

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const steps = [
  "Select Service And Desk",
  "Select Date",
  "How should we notify you?",
];

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

  const [selectedNotificationType, setSelectedNotificationType] =
    React.useState("email");

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
    onSubmit: (values) => {
      console.log("asdasd");
      alert(JSON.stringify(values, null, 2));
    },
  });

  React.useEffect(() => {
    fetchIndServicesAndDesksList().then(({ servicesByDesks, desks }) => {
      setDesksAndServices(servicesByDesks);
      setServicesForm(Object.values(servicesByDesks));
      setDesks(desks);
    });
  }, []);

  // console.log("desksAndServicesForm", allAppointments);

  const getDesksForSelectedService = (service: string) => {
    console.log("service", service, desksAndServices);
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
    if (
      (!formik.touched.email && !formik.values.email) ||
      formik.errors.email ||
      !selectedDesk ||
      !selectedService
    ) {
      return true;
    }
    return false;
  };

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleGoNextFromDialog = () => {
    setDialogOpen(false);
    setActiveStep(1);
  };

  const handleSelectNotificationChange = (e: any) => {
    setSelectedNotificationType(e.target.value);
  };

  const handleCreateNotifierRequest = async () => {
    const payload = {
      desk: selectedDesk,
      service: selectedService,
      email: formik.values.email,
      date: selectedDate,
    };
    setLoadingCreate(true);
    postIndNotifierRequest(payload)
      .then((res) => {
        console.log("ere", res);
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
            "Your email is not verified in our system yet. Please go to your email and verify it. After verify your email, Comeback and submit this request again."
          );
        }
      })
      .finally(() => setLoadingCreate(false));
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
  };

  const handleCloseErrorDialog = () => {
    setDialogErrorOpen(false);
    setErrorDesk(null);
  };

  function getStepContent(step: number) {
    switch (step) {
      case 0:
        return (
          <>
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
              <DialogTitle id="alert-dialog-title">
                Soonest available slot
              </DialogTitle>
              <DialogContent>
                {loadingForAppointment ? (
                  <CircularProgress color="inherit" />
                ) : soonestAppointmentData ? (
                  <>
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
                  </>
                ) : (
                  <Typography fontSize={13}>
                    We couldn't find any slot! Please go to IND website
                    directly.
                  </Typography>
                )}
              </DialogContent>

              <DialogActions>
                <Button onClick={handleClose}>Close</Button>
                {/* <Button onClick={handleGoNextFromDialog} autoFocus>
                  Next
                </Button> */}
              </DialogActions>
            </Dialog>

            <Box sx={{ mx: "auto", textAlign: "center", mt: 8 }}>
              {/* <Button variant="outlined">Outlined</Button> */}

              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!selectedDesk || !selectedService}
              >
                Next - choose a date
              </Button>
            </Box>
          </>
        );
      case 1:
        return (
          <>
            <Alert
              severity="info"
              sx={{ mt: 2, mb: 6, maxWidth: "70%", mx: "auto" }}
            >
              <AlertTitle>
                {" "}
                You've selected{" "}
                {capitalizeFirstLetter(
                  desksAndServices[selectedService].label
                )}{" "}
                for {capitalizeFirstLetter(desks[selectedDesk])}
              </AlertTitle>
              Select a date below. We will check IND website every 30 minutes
            </Alert>

            <DatePicker onDateChange={onDateChange} />

            <Box sx={{ mx: "auto", textAlign: "center", mt: 8 }}>
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
            <FormControl>
              <FormLabel id="demo-radio-buttons-group-label">
                Please select your prefered way to get notification
              </FormLabel>
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
                  value="telegram"
                  control={<Radio />}
                  label="Telegram Bot"
                />
              </RadioGroup>
            </FormControl>

            {selectedNotificationType === "email" ? (
              <>
                <Typography sx={{ mt: 4 }}>
                  @Email address (to get notified when new slot becames
                  available)
                </Typography>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="email"
                  label="email"
                  type="email"
                  id="email"
                  autoComplete="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.errors.email ? true : false}
                  helperText={
                    formik.errors.email ? "please enter a valid email" : ""
                  }
                />{" "}
              </>
            ) : (
              <Alert severity="warning">
                To get notification Via Telegram, you need to use our Telegram
                Bot.{" "}
                <Link
                  href="https://t.me/ind_appointment_notifier_bot"
                  variant="body2"
                >
                  Go to Telegram bot
                  {/* <TelegramIcon /> */}
                </Link>
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
                Notify me!
              </Button>
            </Box>

            <Backdrop
              sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={loadingCreate}
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
              <DialogTitle id="alert-dialog-title">Congrats!</DialogTitle>
              <DialogContent>
                {loadingForAppointment ? (
                  <CircularProgress color="inherit" />
                ) : (
                  <>
                    <Typography fontSize={15} fontWeight="bold">
                      You've created a notifier! We will check IND appointments
                      every day and will notify you if a new slot became
                      available.
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
                    <Typography fontSize={15} fontWeight="bold">
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
        );
      default:
        throw new Error("Unknown step");
    }
  }

  return (
    <>
      <CssBaseline />
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 3 }, p: { xs: 2, md: 3 } }}
      >
        <Box
          sx={{
            marginTop: 2,
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 4 }}>
            IND appointments
          </Typography>

          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <React.Fragment>{getStepContent(activeStep)}</React.Fragment>

          <Grid
            container
            display={"flex"}
            alignItems="center"
            textAlign={"center"}
            sx={{ mt: 7 }}
          >
            {/* <Grid item xs>
              <Typography sx={{ mt: 5 }}>Find us on Telegram bot</Typography>
              <Link
                href="https://t.me/ind_appointment_notifier_bot"
                variant="body2"
              >
                <TelegramIcon />
              </Link>
            </Grid> */}
          </Grid>
        </Box>
      </Paper>
    </>
  );
}
