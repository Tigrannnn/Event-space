const DAY_MS = 24 * 60 * 60 * 1000;

export function daysBetween(from: string, to: string): string[] {
	const days: string[] = [];
	const end = Date.parse(`${to}T00:00:00Z`);
	for (let time = Date.parse(`${from}T00:00:00Z`); time <= end; time += DAY_MS) {
		days.push(new Date(time).toISOString().slice(0, 10));
	}
	return days;
}
