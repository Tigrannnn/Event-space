import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Locale } from '@event-space/shared';

@Injectable()
export class CategoryService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll() {
		return await this.prisma.category.findMany({
			include: {
				translations: true,
			},
		});
	}
}
