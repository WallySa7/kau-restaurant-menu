// Helpers for working with the Sun–Sat "menu week" model (Saudi calendar).
// All YYYY-MM-DD strings are interpreted in *local* time, not UTC, so the
// week start does not drift by a day when the browser timezone is east of UTC.

function toLocalDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fromLocalDateStr(value) {
  if (value instanceof Date) return new Date(value);
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Today as YYYY-MM-DD in the local timezone.
export function today() {
  return toLocalDateStr(new Date());
}

// Returns the Sunday of the week containing `date` as a YYYY-MM-DD string.
export function sundayOf(date = new Date()) {
  const d = typeof date === 'string' ? fromLocalDateStr(date) : new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return toLocalDateStr(d);
}

// Returns YYYY-MM-DD for `weekStart` plus `dayOfWeek` (0=Sun … 6=Sat).
export function dateForDay(weekStart, dayOfWeek) {
  const d = fromLocalDateStr(weekStart);
  d.setDate(d.getDate() + dayOfWeek);
  return toLocalDateStr(d);
}

// Locale-aware short date label for menu headers.
export function formatDate(dateStr, locale = 'en') {
  const d = fromLocalDateStr(dateStr);
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6];
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];
