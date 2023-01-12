import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { CalendarPicker } from "@mui/x-date-pickers/CalendarPicker";

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
    console.log("asdasd", formatedDate);
    onDateChange(formatedDate);
  }, [value]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CalendarPicker
        openTo="day"
        date={value}
        shouldDisableDate={isWeekend}
        onChange={(newValue) => {
          setValue(newValue as any);
        }}
        // renderInput={(params) => <TextField {...params} />}
        disablePast
        maxDate={maxDate}
      />
    </LocalizationProvider>
  );
};

export default DatePicker;
