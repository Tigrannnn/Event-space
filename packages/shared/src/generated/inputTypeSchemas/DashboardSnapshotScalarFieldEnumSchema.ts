import { z } from 'zod';

export const DashboardSnapshotScalarFieldEnumSchema = z.enum(['date','totalEvents','totalUsers','publishedEvents','draftEvents','cancelledEvents','totalBookings','pendingBookings','confirmedBookings','cancelledBookings','expiredBookings','totalCapacity','usedCapacity','totalRevenue','createdAt']);

export default DashboardSnapshotScalarFieldEnumSchema;
