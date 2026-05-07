import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { EventModule } from '@modules/event/event.module';

@Module({
	imports: [EventModule],
	controllers: [AdminController],
	providers: [AdminService],
})
export class AdminModule {}
