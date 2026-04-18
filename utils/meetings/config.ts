import type { MeetingsConfig, PublicMeetingsConfig } from '@/types/meetings';

/**
 * Default config used for first-time setup or when the admin doc doesn't exist yet.
 * Picked to be safe defaults: feature off, working hours Mon-Fri 10:00-18:00 Europe/Bucharest,
 * €50/hr, 12h lead time min, 14 days max ahead, 30..120min duration in 30min steps.
 */
export const DEFAULT_MEETINGS_CONFIG: MeetingsConfig = {
  enabled: false,
  hourlyRateAmount: 5000, // 50.00
  currency: 'eur',
  minLeadTimeHours: 12,
  maxLeadTimeHours: 24 * 14, // 14 days
  minDurationMinutes: 30,
  maxDurationMinutes: 120,
  durationStepMinutes: 30,
  bufferMinutes: 15,
  weeklyAvailability: {
    '0': { enabled: false, startMinutes: 600, endMinutes: 1080 }, // Sun
    '1': { enabled: true, startMinutes: 600, endMinutes: 1080 }, // Mon 10:00-18:00
    '2': { enabled: true, startMinutes: 600, endMinutes: 1080 },
    '3': { enabled: true, startMinutes: 600, endMinutes: 1080 },
    '4': { enabled: true, startMinutes: 600, endMinutes: 1080 },
    '5': { enabled: true, startMinutes: 600, endMinutes: 1080 }, // Fri
    '6': { enabled: false, startMinutes: 600, endMinutes: 1080 }, // Sat
  },
  blackoutDates: [],
  timezone: 'Europe/Bucharest',
  requiresActiveSubscription: true,
  publicNote: '',
};

/** Strip admin-only fields for public consumption. */
export function toPublicConfig(c: MeetingsConfig): PublicMeetingsConfig {
  return {
    enabled: c.enabled,
    hourlyRateAmount: c.hourlyRateAmount,
    currency: c.currency,
    minLeadTimeHours: c.minLeadTimeHours,
    maxLeadTimeHours: c.maxLeadTimeHours,
    minDurationMinutes: c.minDurationMinutes,
    maxDurationMinutes: c.maxDurationMinutes,
    durationStepMinutes: c.durationStepMinutes,
    bufferMinutes: c.bufferMinutes,
    weeklyAvailability: c.weeklyAvailability,
    blackoutDates: c.blackoutDates,
    timezone: c.timezone,
    requiresActiveSubscription: c.requiresActiveSubscription,
    publicNote: c.publicNote,
  };
}

/** Compute amount in smallest unit for a given duration. */
export function computeMeetingPrice(hourlyAmount: number, durationMinutes: number): number {
  // Round to nearest cent to avoid float artifacts.
  return Math.round((hourlyAmount * durationMinutes) / 60);
}
