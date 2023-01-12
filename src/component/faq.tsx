import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function Faq() {
  return (
    <div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>How we can help you?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            We will help you to find IND appointment sooner! How? You give us
            the date, service and desk that you want to make an appointment then
            we will check IND website every 30 minutes and will notifiy you when
            a new slot became available.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography>Is this app belongs to IND?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            <b>NO</b>
            We are <b>Not</b> a part of IND and we are not working for IND and
            none of this app is officaly belong to IND. We've just made an
            application to help people to get IND appointments sooner and we
            can't help you with IND proccesses or any other matter.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography>Data and Privacy</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            We <b>do not</b> keep any of your personal data on our database. we will save your telegram ID and email
            to send you notification. 
          </Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
