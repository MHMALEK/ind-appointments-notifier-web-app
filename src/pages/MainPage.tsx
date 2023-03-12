import "./mainPage.scss";
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
  StepContent,
  StepLabel,
  Stepper,
} from "@mui/material";
import {
  fetchIndServicesAndDesksList,
  getSoonestAppointment,
  getSoonestAppointmentsForAllDesksAndServices,
  postIndNotifierRequest,
  postIndNotifierRequestEmail,
} from "../services/api.index";
import DatePicker from "../shared/datepicker.component";

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
});

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const MainPage = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep: number) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep: number) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

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

  const [selectedDate, setSelectedDate] = React.useState<any>(null);
  const [loadingCreate, setLoadingCreate] = React.useState<boolean>(false);

  const [selectedNotificationType, setSelectedNotificationType] =
    React.useState("email");

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

  const steps = [
    {
      label: "IND service",
      description: (
        <>
          <p className="text-sm mt-8 mb-4">
            Which IND desk you want to make appointment?
          </p>
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
          {selectedService && selectedDesk && soonestAppointmentData && (
            <Alert severity="info" sx={{ mt: 2, mb: 2, mx: "auto" }}>
              <p className="text-sm">
                You've selected{" "}
                {capitalizeFirstLetter(desksAndServices[selectedService].label)}
                for {capitalizeFirstLetter(desks[selectedDesk])}.
                {soonestAppointmentData ? (
                  <>
                    <p className="text-sm">
                      {" "}
                      Soonest available slot is {
                        soonestAppointmentData.date
                      }{" "}
                      from {soonestAppointmentData.startTime} to{" "}
                      {soonestAppointmentData.endTime}.
                    </p>
                  </>
                ) : (
                  <Typography fontSize={13}>
                    We couldn't find any slot! Please go to IND website
                    directly.
                  </Typography>
                )}
              </p>
            </Alert>
          )}

          <h2 className="text-sm mt-12 mb-8 font-bold">
            Select a date that you want to be notified if a sooner slot became
            available
          </h2>

          <Dialog
            open={false}
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
                    There is an slot available at {
                      soonestAppointmentData.date
                    }{" "}
                    from {soonestAppointmentData.startTime} to{" "}
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
                  We couldn't find any slot! Please go to IND website directly.
                </Typography>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </Dialog>
          <>
            <Paper>
              <DatePicker onDateChange={onDateChange} />
            </Paper>

            <Typography sx={{ mt: 3, px: 1 }}></Typography>
          </>
        </>
      ),
    },
    {
      label: "How you want to recive the Notifications?",
      description: (
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
                @Email address (to get notified when new slot becames available)
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
      ),
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-0 sm:p-12">
        <div className="mx-auto max-w-xl px-6 py-12 bg-white border-0 shadow-lg sm:rounded-3xl">
          <h1 className="text-2xl font-bold mb-8">IND Appointments</h1>
          <p className="text-sm">
            you can select your desired service and desk and time that you want
            to make an appointment at IND and we will inform you when a sooner
            slot became available on that desk and service! We're not working
            for IND and has nothing to do with your IND proccess! just a simple
            helper to help you make IND appointments sooner!
          </p>
          <Stepper
            activeStep={activeStep}
            orientation="vertical"
            style={{ marginTop: 30 }}
          >
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  optional={
                    index === 2 ? (
                      <Typography variant="caption">Last step</Typography>
                    ) : null
                  }
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  {step.description}
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        {index === steps.length - 1 ? "Finish" : "Continue"}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Back
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length && (
            <Paper square elevation={0} sx={{ p: 3 }}>
              <Typography>
                All steps completed - you&apos;re finished
              </Typography>
              <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                Reset
              </Button>
            </Paper>
          )}
        </div>
      </div>
    </>
  );
};

export default MainPage;
