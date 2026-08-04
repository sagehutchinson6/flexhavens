/**
 * Platform timezone: Africa/Lagos (WAT, UTC+1).
 * Imported first in boot.ts so every server-side Date operation —
 * scheduled jobs, notification timestamps, audit logs, emails —
 * runs on Nigerian local time.
 */
process.env.TZ = process.env.TZ || "Africa/Lagos";
