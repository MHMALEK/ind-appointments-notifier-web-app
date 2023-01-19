import * as React from "react";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import SwipeableViews from "react-swipeable-views";

import Title from "./Title";
import { getSoonestAppointmentsForAllDesksAndServices } from "../component/api-calls.service";
import {
  capitalize,
  CircularProgress,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Orders() {
  const [allAppointments, setAllAppointments] = React.useState<any>({});

  React.useEffect(() => {
    getSoonestAppointmentsForAllDesksAndServices().then((res) => {
      console.log("asd", res);
      setAllAppointments(res);
    });
  }, []);

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };
  return (
    <React.Fragment>
      {!allAppointments.doc ? (
        <CircularProgress
          sx={{ textAlign: "center", mx: "auto", mb: 5, mt: 3 }}
          color="inherit"
        />
      ) : (
        <Box sx={{ width: "100%" }}>
          {/* <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
              variant="fullWidth"
            >
              <Tab label="" />
              <Tab label="Biometrics" />
              <Tab label="Return visa" />
              <Tab label="Residence endorsement sticker" />
            </Tabs>
          </Box>
          <SwipeableViews index={value} onChangeIndex={handleChangeIndex}> */}
          <Title>collect residency documents</Title>
          <Box sx={{ my: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Desk</TableCell>
                  <TableCell>Date</TableCell>

                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allAppointments.doc.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <b>{capitalize(row.deskLabel)}</b>
                    </TableCell>
                    <TableCell>
                      {row.date} from {row.startTime} to {row.endTime}
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <a
                        href="https://oap.ind.nl/oap/en/#/doc"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Book
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <Title>Biometrics</Title>
          <Box sx={{ my: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Desk</TableCell>
                  <TableCell>Date</TableCell>

                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allAppointments.bio.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <b>{capitalize(row.deskLabel)}</b>
                    </TableCell>
                    <TableCell>
                      {row.date} from {row.startTime} to {row.endTime}
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <a
                        href="https://oap.ind.nl/oap/en/#/BIO"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Book
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <Title>Residence endorsement sticker</Title>
          <Box sx={{ my: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Desk</TableCell>
                  <TableCell>Date</TableCell>

                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allAppointments.vaa.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <b>{capitalize(row.deskLabel)}</b>
                    </TableCell>
                    <TableCell>
                      {row.date} from {row.startTime} to {row.endTime}
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <a
                        href="https://oap.ind.nl/oap/en/#/VAA"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Book
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <Title>Return visa</Title>
          <Box sx={{ my: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Desk</TableCell>
                  <TableCell>Date</TableCell>

                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allAppointments.tkv.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <b>{capitalize(row.deskLabel)}</b>
                    </TableCell>
                    <TableCell>
                      {row.date} from {row.startTime} to {row.endTime}
                    </TableCell>
                    <TableCell align="right">
                      <a
                        href="https://oap.ind.nl/oap/en/#/TKV"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Book
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      )}
    </React.Fragment>
  );
}
