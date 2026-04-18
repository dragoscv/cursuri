import type {
  AvailabilitySlot,
  Meeting,
  MeetingsConfig,
} from '@/types/meetings';

/**
 * Slot computation in the admin's timezone using Intl.DateTimeFormat
 * (no extra dependency on date-fns-tz).
 *
 * Strategy:
 *  - For each calendar day in [from, to] (inclusive), in admin TZ:
 *    1. Skip if blackout date or weekday disabled
 *    2. Build window startMinutes..endMinutes in admin TZ → convert each candidate slot to UTC
 *    3. Step every `durationStepMinutes`; emit slots where start >= minLead and start+duration <= window end
 *    4. Filter against existing busy meetings (confirmed + pending_payment) with bufferMinutes padding
 *    5. Apply maxLeadTime cap
 */

interface ComputeArgs {
  config: MeetingsConfig;
  durationMinutes: number;
  /** UTC unix ms inclusive */
  fromUtcMs: number;
  /** UTC unix ms inclusive */
  toUtcMs: number;
  /** Existing booked meetings (confirmed or pending_payment), used to subtract busy windows. */
  busyMeetings: Pick<Meeting, 'startAt' | 'endAt' | 'status'>[];
  /** "Now" reference, defaults to Date.now(). */
  nowUtcMs?: number;
}

/** Convert "y-m-d h:m" in a named IANA timezone to a UTC Date. */
function zonedDateTimeToUtc(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
  timezone: string
): Date {
  // Construct a UTC date matching the wall clock, then adjust by the TZ offset for that instant.
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offsetMs = getTimezoneOffsetMs(utcGuess, timezone);
  // utcGuess represents "as if it were UTC". The actual UTC instant is utcGuess - offset.
  return new Date(utcGuess - offsetMs);
}

/** Returns the offset (zone − UTC) in ms for a given UTC instant. */
function getTimezoneOffsetMs(utcMs: number, timezone: string): number {
  // Use formatToParts to derive what wall-clock the zone shows for this UTC instant.
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = dtf.formatToParts(new Date(utcMs));
  const map: Record<string, string> = {};
  for (const p of parts) if (p.type !== 'literal') map[p.type] = p.value;
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour === '24' ? '00' : map.hour),
    Number(map.minute),
    Number(map.second)
  );
  return asUtc - utcMs;
}

/** Given a UTC instant, return {y,m,d,weekday(0=Sun)} as seen in the named timezone. */
function getZonedDateParts(
  utcMs: number,
  timezone: string
): { year: number; month: number; day: number; weekday: number } {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = dtf.formatToParts(new Date(utcMs));
  const map: Record<string, string> = {};
  for (const p of parts) if (p.type !== 'literal') map[p.type] = p.value;
  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    weekday: weekdayMap[map.weekday] ?? 0,
  };
}

/** Add N days to (y,m,d) and return new (y,m,d). */
function addDays(y: number, m: number, d: number, n: number): { y: number; m: number; d: number } {
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

/** YYYY-MM-DD format for blackout matching. */
function ymdString(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function computeAvailableSlots(args: ComputeArgs): AvailabilitySlot[] {
  const { config, durationMinutes, fromUtcMs, toUtcMs, busyMeetings } = args;
  const now = args.nowUtcMs ?? Date.now();
  const earliestStart = now + config.minLeadTimeHours * 3_600_000;
  const latestStart = now + config.maxLeadTimeHours * 3_600_000;

  const effectiveFrom = Math.max(fromUtcMs, earliestStart);
  const effectiveTo = Math.min(toUtcMs, latestStart);
  if (effectiveTo <= effectiveFrom) return [];

  const blackoutSet = new Set(config.blackoutDates);
  const stepMs = config.durationStepMinutes * 60_000;
  const durationMs = durationMinutes * 60_000;
  const bufferMs = config.bufferMinutes * 60_000;

  // Pre-compute busy ranges with buffer.
  const busy = busyMeetings
    .filter((m) => m.status === 'confirmed' || m.status === 'pending_payment')
    .map((m) => ({ start: m.startAt - bufferMs, end: m.endAt + bufferMs }));

  function overlapsBusy(start: number, end: number): boolean {
    for (const b of busy) {
      if (start < b.end && end > b.start) return true;
    }
    return false;
  }

  // Iterate calendar days in admin's TZ.
  const slots: AvailabilitySlot[] = [];
  const startParts = getZonedDateParts(effectiveFrom, config.timezone);
  const endParts = getZonedDateParts(effectiveTo, config.timezone);

  // Convert end day to a comparable number.
  const endNum = endParts.year * 10000 + endParts.month * 100 + endParts.day;

  let cursor = { y: startParts.year, m: startParts.month, d: startParts.day };
  // Safety cap: 90 days max iteration even if config is misconfigured.
  for (let i = 0; i < 90; i++) {
    const cursorNum = cursor.y * 10000 + cursor.m * 100 + cursor.d;
    if (cursorNum > endNum) break;

    const dateStr = ymdString(cursor.y, cursor.m, cursor.d);
    if (!blackoutSet.has(dateStr)) {
      // Determine weekday for this date in admin TZ at noon (avoids DST edge ambiguity).
      const noonUtc = zonedDateTimeToUtc(cursor.y, cursor.m, cursor.d, 12, 0, config.timezone);
      const weekday = getZonedDateParts(noonUtc.getTime(), config.timezone).weekday;
      const window = config.weeklyAvailability[String(weekday)];

      if (window?.enabled) {
        // Generate candidate start times within window.
        for (let mm = window.startMinutes; mm + durationMinutes <= window.endMinutes; mm += config.durationStepMinutes) {
          const hh = Math.floor(mm / 60);
          const min = mm % 60;
          const startUtc = zonedDateTimeToUtc(cursor.y, cursor.m, cursor.d, hh, min, config.timezone).getTime();
          const endUtc = startUtc + durationMs;

          if (startUtc < effectiveFrom || startUtc > effectiveTo) continue;
          if (overlapsBusy(startUtc, endUtc)) continue;

          slots.push({ startAt: startUtc, endAt: endUtc, durationMinutes });
          // step is intrinsic to the for loop via durationStepMinutes
          void stepMs;
        }
      }
    }

    const next = addDays(cursor.y, cursor.m, cursor.d, 1);
    cursor = { y: next.y, m: next.m, d: next.d };
  }

  return slots;
}

/** Returns true if a proposed booking conflicts with any existing busy meeting (with buffer). */
export function hasConflict(
  startAt: number,
  endAt: number,
  bufferMinutes: number,
  busyMeetings: Pick<Meeting, 'startAt' | 'endAt' | 'status'>[]
): boolean {
  const bufferMs = bufferMinutes * 60_000;
  for (const m of busyMeetings) {
    if (m.status !== 'confirmed' && m.status !== 'pending_payment') continue;
    if (startAt < m.endAt + bufferMs && endAt > m.startAt - bufferMs) return true;
  }
  return false;
}

/** Validates a proposed booking against config rules. Returns null if OK, else error code. */
export function validateBookingRequest(
  config: MeetingsConfig,
  startAt: number,
  durationMinutes: number,
  nowUtcMs: number = Date.now()
): string | null {
  if (!config.enabled) return 'feature_disabled';
  if (durationMinutes < config.minDurationMinutes) return 'duration_too_short';
  if (durationMinutes > config.maxDurationMinutes) return 'duration_too_long';
  if (durationMinutes % config.durationStepMinutes !== 0) return 'duration_not_aligned';

  const earliestStart = nowUtcMs + config.minLeadTimeHours * 3_600_000;
  const latestStart = nowUtcMs + config.maxLeadTimeHours * 3_600_000;
  if (startAt < earliestStart) return 'too_soon';
  if (startAt > latestStart) return 'too_far';

  // Check date is not blacked out and weekday is enabled and slot fits in window
  const startParts = getZonedDateParts(startAt, config.timezone);
  const dateStr = ymdString(startParts.year, startParts.month, startParts.day);
  if (config.blackoutDates.includes(dateStr)) return 'blackout_date';

  const noonUtc = zonedDateTimeToUtc(startParts.year, startParts.month, startParts.day, 12, 0, config.timezone);
  const weekday = getZonedDateParts(noonUtc.getTime(), config.timezone).weekday;
  const window = config.weeklyAvailability[String(weekday)];
  if (!window?.enabled) return 'day_disabled';

  // Convert start in admin TZ to minutes-of-day
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: config.timezone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  const parts = dtf.formatToParts(new Date(startAt));
  const map: Record<string, string> = {};
  for (const p of parts) if (p.type !== 'literal') map[p.type] = p.value;
  const startMin = Number(map.hour === '24' ? '00' : map.hour) * 60 + Number(map.minute);
  if (startMin < window.startMinutes) return 'before_window';
  if (startMin + durationMinutes > window.endMinutes) return 'after_window';

  return null;
}
