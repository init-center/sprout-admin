import dayjs from "dayjs";

export function formatTime(time: string, template = "YYYY-MM-DD H:m:s") {
  return dayjs(time).format(template);
}
