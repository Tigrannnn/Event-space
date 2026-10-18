import { toDateKey } from '../../../shared/utils/app-day.util';
import { round2, tourEndsAt } from './dashboard-revenue.util';

export interface ExpectedAdjustment {
	type: 'CHARGE' | 'REFUND';
	amount: number;
	feeAmount: number | null;
	createdAt: Date;
}

export interface ExpectedBooking {
	status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
	cancelledAt: Date | null;
	tourDate: Date;
	durationMinutes: number;
	adjustments: ExpectedAdjustment[];
}

export interface ExpectedTimelinePoint {
	date: string;
	expected: number;
	added: number;
	cancelled: number;
	settled: number;
}

export interface ExpectedTimeline {
	points: ExpectedTimelinePoint[];
	opening: number;
	closing: number;
	totals: { added: number; cancelled: number; settled: number };
}

interface DayDelta {
	added: number;
	cancelled: number;
	settled: number;
}

type Step = { kind: 'money'; at: Date; delta: number } | { kind: 'settle'; at: Date };

export function addDaysToKey(key: string, days: number): string {
	const [year, month, day] = key.split('-').map(Number);
	const moved = new Date(Date.UTC(year, month - 1, day + days));
	return moved.toISOString().slice(0, 10);
}

function settlementMoment(booking: ExpectedBooking): Date {
	const endsAt = tourEndsAt({ date: booking.tourDate, durationMinutes: booking.durationMinutes });

	if (booking.status !== 'CANCELLED') return endsAt;

	const lastRefund = booking.adjustments
		.filter((row) => row.type === 'REFUND')
		.reduce<Date | null>(
			(latest, row) => (latest === null || row.createdAt > latest ? row.createdAt : latest),
			null,
		);
	const cancelledAt = lastRefund ?? booking.cancelledAt;

	if (!cancelledAt) return endsAt;

	return cancelledAt < endsAt ? cancelledAt : endsAt;
}

function stepsOf(booking: ExpectedBooking): Step[] {
	const steps: Step[] = booking.adjustments.map((row) => ({
		kind: 'money' as const,
		at: row.createdAt,
		delta: row.type === 'CHARGE' ? row.amount - (row.feeAmount ?? 0) : -row.amount,
	}));

	steps.push({ kind: 'settle', at: settlementMoment(booking) });

	return steps.sort((a, b) => {
		const byTime = a.at.getTime() - b.at.getTime();
		if (byTime !== 0) return byTime;
		return a.kind === b.kind ? 0 : a.kind === 'money' ? -1 : 1;
	});
}

function collectDeltas(bookings: ExpectedBooking[]): Map<string, DayDelta> {
	const days = new Map<string, DayDelta>();

	const bucket = (at: Date): DayDelta => {
		const key = toDateKey(at);
		const existing = days.get(key);
		if (existing) return existing;
		const created = { added: 0, cancelled: 0, settled: 0 };
		days.set(key, created);
		return created;
	};

	for (const booking of bookings) {
		let held = 0;
		let settled = false;

		for (const step of stepsOf(booking)) {
			if (settled) break;

			if (step.kind === 'settle') {
				if (held !== 0) bucket(step.at).settled += held;
				held = 0;
				settled = true;
				continue;
			}

			held += step.delta;
			if (step.delta > 0) bucket(step.at).added += step.delta;
			else bucket(step.at).cancelled += -step.delta;
		}
	}

	return days;
}

export function buildExpectedTimeline(
	bookings: ExpectedBooking[],
	from: string,
	to: string,
	now: Date,
): ExpectedTimeline {
	const deltas = collectDeltas(bookings);
	const lastKey = toDateKey(now) < to ? toDateKey(now) : to;

	let running = 0;
	for (const [key, day] of deltas) {
		if (key < from) running += day.added - day.cancelled - day.settled;
	}
	const opening = round2(running);

	const points: ExpectedTimelinePoint[] = [];
	const totals = { added: 0, cancelled: 0, settled: 0 };

	for (let key = from; key <= lastKey; key = addDaysToKey(key, 1)) {
		const day = deltas.get(key) ?? { added: 0, cancelled: 0, settled: 0 };
		running += day.added - day.cancelled - day.settled;
		totals.added += day.added;
		totals.cancelled += day.cancelled;
		totals.settled += day.settled;

		points.push({
			date: key,
			expected: round2(running),
			added: round2(day.added),
			cancelled: round2(day.cancelled),
			settled: round2(day.settled),
		});
	}

	return {
		points,
		opening,
		closing: points.length > 0 ? points[points.length - 1].expected : opening,
		totals: {
			added: round2(totals.added),
			cancelled: round2(totals.cancelled),
			settled: round2(totals.settled),
		},
	};
}
