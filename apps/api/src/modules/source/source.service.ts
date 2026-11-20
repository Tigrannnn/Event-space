import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { resolveSourceRef } from './source-access';

@Injectable()
export class SourceService {
	constructor(private readonly prisma: PrismaService) {}

	async recordVisit(raw: string): Promise<{ recorded: boolean }> {
		const resolved = await resolveSourceRef(this.prisma, raw);
		if (!resolved?.sourceRef) return { recorded: false };

		await this.prisma.sourceVisit.create({
			data: { ref: resolved.sourceRef, sourceId: resolved.sourceId },
		});
		return { recorded: true };
	}
}
