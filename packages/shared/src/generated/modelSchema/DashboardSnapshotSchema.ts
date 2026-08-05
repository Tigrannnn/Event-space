import { z } from 'zod';

/////////////////////////////////////////
// DASHBOARD SNAPSHOT SCHEMA
/////////////////////////////////////////

/**
 * One finished day of state that nothing else can reconstruct.
 * 
 * Booking counts and revenue used to live here too. They no longer do: [BookingStatusHistory]
 * answers "how many were confirmed on that day" from the intervals themselves, and
 * [BookingAdjustment] answers "how much money moved" from rows that carry their own dates. Both
 * beat a daily freeze, which can only ever be as good as the last time the job ran.
 * 
 * What is left is state with no such record behind it — event statuses and occurrence capacity
 * are overwritten in place, so a day that was not frozen is genuinely gone.
 */
export const DashboardSnapshotSchema = z.object({
  date: z.coerce.date(),
  totalEvents: z.number().int(),
  totalUsers: z.number().int(),
  publishedEvents: z.number().int(),
  draftEvents: z.number().int(),
  cancelledEvents: z.number().int(),
  totalCapacity: z.number().int(),
  usedCapacity: z.number().int(),
  createdAt: z.coerce.date(),
})

export type DashboardSnapshot = z.infer<typeof DashboardSnapshotSchema>

export default DashboardSnapshotSchema;
