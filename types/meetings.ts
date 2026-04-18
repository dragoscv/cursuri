/**
 * "Book a Call" — paid 1-on-1 meeting types.
 * Stored in Firestore under `meetingsConfig/global` (singleton) and `meetings/{id}`.
 */

export type MeetingStatus =
  | 'pending_payment' // user started checkout but Stripe hasn't confirmed yet
  | 'confirmed'       // paid, slot reserved
  | 'cancelled'       // user/admin cancelled (refund handled separately)
  | 'completed'       // meeting happened
  | 'no_show';        // user didn't show up

/** Per-weekday availability window. Day index: 0=Sunday .. 6=Saturday. */
export interface WeekdayWindow {
  enabled: boolean;
  /** Minutes from midnight in the admin's timezone. e.g. 540 = 09:00 */
  startMinutes: number;
  /** Minutes from midnight in the admin's timezone. e.g. 1080 = 18:00 */
  endMinutes: number;
}

/** Singleton admin config doc: meetingsConfig/global */
export interface MeetingsConfig {
  /** Master kill-switch. If false, public booking page shows "currently unavailable". */
  enabled: boolean;

  /** Hourly rate in the smallest currency unit (cents/bani). e.g. 5000 = 50.00 */
  hourlyRateAmount: number;
  /** ISO 4217, lowercase. e.g. 'eur', 'ron', 'usd' */
  currency: string;

  /** Stripe linkage (managed by admin save). */
  stripeProductId?: string;
  /** Reference price (per 60min). Actual checkout uses dynamic price_data per booking. */
  stripePriceId?: string;

  /** Earliest a user can book from "now". e.g. 12 = no bookings within 12h. */
  minLeadTimeHours: number;
  /** Latest a user can book ahead. e.g. 72 = up to 3 days out. */
  maxLeadTimeHours: number;

  /** Smallest meeting size, in minutes. e.g. 30. */
  minDurationMinutes: number;
  /** Largest meeting size, in minutes. e.g. 240 (4h). */
  maxDurationMinutes: number;
  /** Granularity for both duration and slot start times. e.g. 30. */
  durationStepMinutes: number;
  /** Buffer between consecutive meetings, in minutes. e.g. 15. */
  bufferMinutes: number;

  /** Per-weekday availability map (keys 0..6 as strings, Sunday=0). */
  weeklyAvailability: Record<string, WeekdayWindow>;

  /** Blackout dates (admin's timezone), ISO date strings 'YYYY-MM-DD'. */
  blackoutDates: string[];

  /** Admin's working timezone, IANA name (e.g. 'Europe/Bucharest'). */
  timezone: string;

  /** If true, only users with an active subscription can complete checkout. */
  requiresActiveSubscription: boolean;

  /** Optional, free-form admin note shown on landing (e.g. response time). */
  publicNote?: string;

  updatedAt?: number; // unix ms
  updatedBy?: string;
}

/** A booked meeting doc: meetings/{meetingId} */
export interface Meeting {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;

  /** UTC unix ms of meeting start. */
  startAt: number;
  /** UTC unix ms of meeting end. */
  endAt: number;
  durationMinutes: number;

  /** User's IANA timezone at the time of booking (for display). */
  timezone: string;

  /** Topic / agenda (user-provided, required). */
  topic: string;
  /** Optional extra notes from user. */
  notes?: string;

  status: MeetingStatus;

  // Pricing snapshot, locked at booking time
  hourlyRateAmount: number;
  currency: string;
  totalAmount: number;

  // Stripe tracking
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  paidAt?: number;

  // Admin-managed
  meetLink?: string;
  meetLinkAddedAt?: number;
  adminNotes?: string;
  cancelledAt?: number;
  cancelReason?: string;

  createdAt: number;
  updatedAt: number;
}

/** Public-safe subset of MeetingsConfig (no Stripe IDs leaked). */
export interface PublicMeetingsConfig {
  enabled: boolean;
  hourlyRateAmount: number;
  currency: string;
  minLeadTimeHours: number;
  maxLeadTimeHours: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  durationStepMinutes: number;
  bufferMinutes: number;
  weeklyAvailability: Record<string, WeekdayWindow>;
  blackoutDates: string[];
  timezone: string;
  requiresActiveSubscription: boolean;
  publicNote?: string;
}

/** Computed available time slot. */
export interface AvailabilitySlot {
  /** UTC unix ms */
  startAt: number;
  /** UTC unix ms */
  endAt: number;
  durationMinutes: number;
}
