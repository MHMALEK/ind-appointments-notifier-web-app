import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { PickersActionBar } from "@mui/x-date-pickers";

const isWeekend = (date: Dayjs) => {
  const day = date.day();

  return day === 0 || day === 6;
};

const DatePicker: React.FC<any> = ({ onDateChange }) => {
  const [value, setValue] = React.useState<Dayjs | null>(dayjs(new Date()));

  const dayJsUtils = dayjs;
  const maxDate = dayJsUtils().add(70, "day");

  React.useEffect(() => {
    const formatedDate = dayJsUtils(value).format("YYYY/MM/DD");
    onDateChange(formatedDate);
  }, [value]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StaticDatePicker
        openTo="day"
        value={value}
        shouldDisableDate={isWeekend}
        onChange={(newValue) => {
          setValue(newValue as any);
        }}
        disablePast
        maxDate={maxDate}
        slotProps={{
          actionBar: { sx: { display: "none" } },
          layout: { sx: { boxShadow: "none", border: "none", margin: "0" } },
        }}
        sx={{
          border: "none",
          boxShadow: "none",
          textAlign: "left",
          margin: "0",
        }}
      />
    </LocalizationProvider>
  );
};

export default DatePicker;
