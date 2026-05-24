import { PrismaService } from '@infra/prisma/prisma.service';
import { assertTestDatabaseUrl } from './assert-test-env';

/** Wipes all app tables. Only runs when DATABASE_URL points at a test database. */
export async function resetDatabase(prisma: PrismaService): Promise<void> {
	assertTestDatabaseUrl();

	await prisma.$executeRawUnsafe(`
		TRUNCATE TABLE
			"bookings",
			"event_images",
			"refresh_tokens",
			"events",
			"users"
		RESTART IDENTITY CASCADE;
	`);
}
