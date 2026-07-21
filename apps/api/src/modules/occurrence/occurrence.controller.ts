import { Body, Controller, Delete, Param, Patch } from '@nestjs/common';
import { OccurrenceService } from './occurrence.service';
import { Roles } from '@shared';
import { CancelOccurrenceData, UserRoleSchema } from '@event-space/shared';

@Controller('admin/occurrences')
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
}