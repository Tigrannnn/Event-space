import { BadRequestException } from '@nestjs/common';

export function parseOptionalQueryInt(value?: string, fieldName = 'value'): number | undefined {
	if (value === undefined || value === '') {
		return undefined;
	}

	const parsed = Number(value);
	if (!Number.isFinite(parsed)) {
		throw new BadRequestException(`${fieldName} must be a valid number`);
	}

	return parsed;
}
