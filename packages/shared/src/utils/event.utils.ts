export function isEventAvailable(event: {
	status: string;
	date: Date | string;
	duration: number;
}): boolean {
	if (event.status !== 'PUBLISHED') return false;
	const endTime = new Date(event.date).getTime() + event.duration * 60 * 1000;
	if (endTime < Date.now()) return false;
	return true;
}
