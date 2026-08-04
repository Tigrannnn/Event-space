import { z } from 'zod';
import { Prisma } from '@prisma/client'

/////////////////////////////////////////
// DASHBOARD SNAPSHOT SCHEMA
/////////////////////////////////////////

/**
 * A frozen daily snapshot of dashboard state.
 * 
 * State metrics cannot be recomputed from live data after the fact: a booking confirmed in
 * January and refunded in April is no longer CONFIRMED today, so querying "January revenue"
 * now would silently return less than January actually showed. Freezing each finished day
 * keeps history stable.
 * 
 * Flow metrics (how many bookings were created in a period) are deliberately absent — those
 * are derived from `created_at` and never drift, so they stay live queries.
 */
export const DashboardSnapshotSchema = z.object({
  /**
   * The calendar day this snapshot describes, at UTC midnight. It is the primary key, so the
   * job can be re-run for a day without creating duplicates.
   */
  date: z.coerce.date(),
  totalEvents: z.number().int(),
  totalUsers: z.number().int(),
  publishedEvents: z.number().int(),
  draftEvents: z.number().int(),
  cancelledEvents: z.number().int(),
  totalBookings: z.number().int(),
  pendingBookings: z.number().int(),
  confirmedBookings: z.number().int(),
  cancelledBookings: z.number().int(),
  expiredBookings: z.number().int(),
  totalCapacity: z.number().int(),
  usedCapacity: z.number().int(),
  /**
   * Revenue as it stood on that day, not as it looks now.
   */
  totalRevenue: z.instanceof(Prisma.Decimal, { message: "Field 'totalRevenue' must be a Decimal. Location: ['Models', 'DashboardSnapshot']"}),
  createdAt: z.coerce.date(),
})

export type DashboardSnapshot = z.infer<typeof DashboardSnapshotSchema>

export default DashboardSnapshotSchema;
