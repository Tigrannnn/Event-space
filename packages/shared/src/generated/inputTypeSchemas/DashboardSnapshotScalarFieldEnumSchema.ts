import { z } from 'zod';

export const DashboardSnapshotScalarFieldEnumSchema = z.enum(['date','totalEvents','totalUsers','publishedEvents','draftEvents','cancelledEvents','totalCapacity','usedCapacity','createdAt']);

export default DashboardSnapshotScalarFieldEnumSchema;
