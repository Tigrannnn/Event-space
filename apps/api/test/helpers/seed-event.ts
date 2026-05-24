import { EventDifficulty, EventStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';

const defaultEventData = {
	title: 'E2E Tour',
	description: 'Test event for e2e booking',
	location: 'Yerevan',
	date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
	difficulty: EventDifficulty.EASY,
	price: new Prisma.Decimal(49.99),
	maxParticipants: 10,
	currentParticipants: 0,
	category: 'Adventure',
	whatsIncluded: ['Guide'],
	duration: 180,
	status: EventStatus.PUBLISHED,
};

export type CreateTestEventOverrides = Partial<
	Omit<Prisma.EventCreateInput, 'organizer' | 'userId'>
>;

export async function createTestEvent(
	prisma: PrismaService,
	organizerId: string,
	overrides: CreateTestEventOverrides = {},
) {
	return prisma.event.create({
		data: {
			...defaultEventData,
			...overrides,
			userId: organizerId,
		},
	});
}

/** @deprecated Use createTestEvent — kept for readability in tests */
export const createPublishedEvent = createTestEvent;
