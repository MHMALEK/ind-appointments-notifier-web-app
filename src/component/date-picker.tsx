import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { Paper } from "@mui/material";

const isWeekend = (date: Dayjs) => {
  const day = date.day();

  return day === 0 || day === 6;
};

const DatePicker: React.FC<any> = ({ onDateChange }) => {
  const [value, setValue] = React.useState<Dayjs | null>(dayjs(new Date()));

  const dayJsUtils = dayjs;
  const maxDate = dayJsUtils().add(70, "day");

  React.useEffect(() => {
    const formatedDate = dayJsUtils(value).format("DD/MM/YYYY");
    console.log("asdasd", formatedDate);
    onDateChange(formatedDate);
  }, [value]);

  return (
    <Paper sx={{ my: 4 }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <StaticDatePicker
          componentsProps={{
            actionBar: {
              actions: [],
            },
          }}
          // orientation="landscape"
          openTo="day"
          value={value}
          shouldDisableDate={isWeekend}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => <TextField {...params} />}
          disablePast
          maxDate={maxDate}
        />
      </LocalizationProvider>
    </Paper>
  );
};

export default DatePicker;
