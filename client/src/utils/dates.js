// Date helpers. Everything works on plain "YYYY-MM-DD" strings.
const DAY_MS = 24 * 60 * 60 * 1000;

// Midnight today (UTC clock, built from the local calendar date) in milliseconds
export const todayStart = () => {
  const now = new Date();
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
};

// "2026-11-05" for today + 10, "2026-10-20" for today - 6 ...
export const isoDaysFromToday = (offset) => new Date(todayStart() + offset * DAY_MS).toISOString().slice(0, 10);

// Whole days from today until the date (negative when it is in the past)
export const daysUntil = (isoDate) => Math.round((Date.parse(isoDate) - todayStart()) / DAY_MS);

export const isWithinRange = (isoDate, from, to) => (!from || isoDate >= from) && (!to || isoDate <= to);
