export type Window = { start_time: string; end_time: string };
export type Busy = { appointment_time: string; duration_minutes: number };
export const minutes = (time: string) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
export const timeLabel = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
export function localDate(now = new Date()) {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return `${p.find((p) => p.type === "year")!.value}-${p.find((p) => p.type === "month")!.value}-${p.find((p) => p.type === "day")!.value}`;
}
export function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function availableSlots(
  date: string,
  windows: Window[],
  busy: Busy[],
  duration: number,
  now = new Date(),
) {
  if (!Number.isInteger(duration) || duration <= 0) return [];
  const slots = new Set<string>();
  for (const window of windows) {
    for (
      let start = minutes(window.start_time);
      start + duration <= minutes(window.end_time);
      start += 15
    ) {
      const time = timeLabel(start);
      if (new Date(`${date}T${time}:00-03:00`) <= now) continue;
      if (
        !busy.some(
          (a) =>
            start < minutes(a.appointment_time) + a.duration_minutes &&
            start + duration > minutes(a.appointment_time),
        )
      )
        slots.add(time);
    }
  }
  return [...slots].sort();
}
