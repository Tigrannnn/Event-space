import { Body, Controller, Delete, Param, Patch, UseGuards } from '@nestjs/common';
import { OccurrenceService } from './occurrence.service';
import { Roles, RolesGuard } from '@shared';
import { AccessTokenGuard } from '@modules/auth/guards/access-token.guard';
import { CancelOccurrenceData, UserRoleSchema } from '@event-space/shared';
import type { RescheduleOccurrenceData } from '@event-space/shared';

@Controller('admin/occurrences')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRoleSchema.enum.ADMIN)
export class OccurrenceController {
	constructor(private readonly occurrenceService: OccurrenceService) {}

	@Delete(':id')
	delete(@Param('id') id: string) {
		return this.occurrenceService.delete(id);
	}

	@Patch(':id/cancel')
	cancel(@Param('id') id: string, @Body() data: CancelOccurrenceData) {
		return this.occurrenceService.cancel(id, data);
	}

	@Patch(':id/reschedule')
	reschedule(@Param('id') id: string, @Body() data: RescheduleOccurrenceData) {
		return this.occurrenceService.reschedule(id, data);
	}
}
