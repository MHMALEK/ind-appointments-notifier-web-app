import * as React from "react";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
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
  return (
    <React.Fragment>
      <Box sx={{ my: 4, textAlign: "center" }}>
        <Title>Available appointments by services</Title>
      </Box>

      {!allAppointments.doc ? (
        <CircularProgress
          sx={{ textAlign: "center", mx: "auto", mb: 5, mt: 3 }}
          color="inherit"
        />
      ) : (
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="collect residency documents" />
              <Tab label="Biometrics" />
              <Tab label="Return visa" />
              <Tab label="Residence endorsement sticker" />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
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
                    <TableCell align="right">Book this one</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabPanel>
          <TabPanel value={value} index={1}>
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
                    <TableCell align="right">Book this one</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabPanel>
          <TabPanel value={value} index={2}>
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
                    <TableCell align="right">Book this one</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabPanel>
          <TabPanel value={value} index={3}>
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
                    <TableCell align="right">Book this one</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabPanel>
        </Box>
      )}
    </React.Fragment>
  );
}
