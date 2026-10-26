/**
 * Helper format waktu. Selalu pakai zona Asia/Jakarta, apa pun zona waktu
 * perangkat pengguna — jadwal KRL hanya masuk akal dalam WIB.
 */

const TZ = "Asia/Jakarta";

const hhmm = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const hhmmss = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const longDate = new Intl.DateTimeFormat("id-ID", {
  timeZone: TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
});

const hourOnly = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "numeric", hourCycle: "h23" });

export type TimeInput = string | Date | number;

export const toDate = (v: TimeInput) =>
  typeof v === "number" || typeof v === "string" ? new Date(v) : v;

export const formatClock = (v: TimeInput) => hhmm.format(toDate(v));
export const formatClockSeconds = (v: TimeInput) => hhmmss.format(toDate(v));
export const formatLongDate = (v: TimeInput) => longDate.format(toDate(v));
export const hourInWIB = (v: TimeInput) => Number(hourOnly.format(toDate(v)));

/** Selisih menit (dibulatkan ke bawah) dari `now` ke `target`. */
export function minutesUntil(target: TimeInput, now: number): number {
  return Math.floor((toDate(target).getTime() - now) / 60_000);
}

/** Label hitung mundur untuk papan keberangkatan. */
export function countdownLabel(target: TimeInput, now: number): string {
  const min = minutesUntil(target, now);
  if (min < 0) return "berangkat";
  if (min === 0) return "sekarang";
  if (min < 60) return `${min} mnt`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} j ${m} m` : `${h} jam`;
}

/** "baru saja", "2 mnt lalu", dll. */
export function relativeAgo(v: TimeInput, now: number): string {
  const sec = Math.max(0, Math.round((now - toDate(v).getTime()) / 1000));
  if (sec < 20) return "baru saja";
  if (sec < 60) return `${sec} dtk lalu`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} mnt lalu`;
  return `${Math.round(min / 60)} jam lalu`;
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} mnt`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} j ${m} mnt` : `${h} jam`;
}
