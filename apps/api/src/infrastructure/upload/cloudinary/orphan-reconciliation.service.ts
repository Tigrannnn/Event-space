import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_CONFIG } from '@event-space/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryDeleteQueueService } from './delete-queue.service';

@Injectable()
export class CloudinaryOrphanReconciliationService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(CloudinaryOrphanReconciliationService.name);
	private timer?: NodeJS.Timeout;
	private initialTimer?: NodeJS.Timeout;

	constructor(
		private readonly prisma: PrismaService,
		private readonly deleteQueue: CloudinaryDeleteQueueService,
	) {}

	onModuleInit(): void {
		this.initialTimer = setTimeout(() => {
			void this.reconcileOrphans();
			this.timer = setInterval(
				() => void this.reconcileOrphans(),
				CLOUDINARY_CONFIG.RECONCILIATION.INTERVAL_MS,
			);
		}, CLOUDINARY_CONFIG.RECONCILIATION.INITIAL_DELAY_MS);
	}

	onModuleDestroy(): void {
		if (this.initialTimer) {
			clearTimeout(this.initialTimer);
		}
		if (this.timer) {
			clearInterval(this.timer);
		}
	}

	async reconcileOrphans(): Promise<void> {
		try {
			const referencedIds = await this.loadReferencedPublicIds();
			const cloudinaryIds = await this.listCloudinaryPublicIds();
			const orphans = cloudinaryIds.filter((id) => !referencedIds.has(id));

			if (!orphans.length) {
				this.logger.debug('Cloudinary orphan reconciliation: no orphans found');
				return;
			}

			await this.deleteQueue.enqueueMany(orphans);
			this.logger.warn(
				`Cloudinary orphan reconciliation queued ${orphans.length} asset(s) for deletion`,
			);
		} catch (error) {
			this.logger.error('Cloudinary orphan reconciliation failed', error);
		}
	}

	private async loadReferencedPublicIds(): Promise<Set<string>> {
		const rows = await this.prisma.eventImage.findMany({
			select: { publicId: true },
		});
		return new Set(rows.map((row) => row.publicId));
	}

	private async listCloudinaryPublicIds(): Promise<string[]> {
		const prefix = `${CLOUDINARY_CONFIG.UPLOAD_FOLDER}/`;
		const ids: string[] = [];
		let nextCursor: string | undefined;

		do {
			const response = (await cloudinary.api.resources({
				type: 'upload',
				prefix,
				max_results: 500,
				next_cursor: nextCursor,
			})) as {
				resources: Array<{ public_id: string }>;
				next_cursor?: string;
			};

			for (const resource of response.resources ?? []) {
				ids.push(resource.public_id);
			}
			nextCursor = response.next_cursor;
		} while (nextCursor);

		return ids;
	}
}
