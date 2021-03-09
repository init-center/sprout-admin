import dayjs from "dayjs";

export function formatTime(
  time: string | Date | null,
  template = "YYYY-MM-DD HH:mm:ss"
) {
  return time ? dayjs(time).format(template) : null;
}
