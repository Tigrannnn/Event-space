import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RecordSearchQuerySchema, type RecordSearchQueryData } from '@event-space/shared';
import { GetCurrentUserId, ZodValidationPipe } from '@shared';
import { AccessTokenGuard } from '@modules/auth/guards/access-token.guard';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
	constructor(private readonly searchService: SearchService) {}

	@Get('suggestions')
	@ApiOperation({ summary: 'Tours and categories that match what is being typed' })
	@ApiQuery({ name: 'q', required: true })
	suggestions(@Query('q') query?: string) {
		return this.searchService.suggest(query ?? '');
	}

	@Get('recommended')
	@ApiOperation({ summary: 'Tours to offer before anything is typed: most booked, then random' })
	recommended() {
		return this.searchService.recommended();
	}

	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@Get('history')
	@ApiOperation({ summary: "The visitor's recent searches, newest first" })
	history(@GetCurrentUserId() userId: string) {
		return this.searchService.history(userId);
	}

	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@Post('history')
	@HttpCode(204)
	@ApiOperation({ summary: 'Remember a search the visitor submitted' })
	async record(
		@GetCurrentUserId() userId: string,
		@Body(new ZodValidationPipe(RecordSearchQuerySchema)) data: RecordSearchQueryData,
	) {
		await this.searchService.record(userId, data.query);
	}

	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@Delete('history/:id')
	@HttpCode(204)
	@ApiOperation({ summary: 'Take a search out of the visitor’s suggestions' })
	async forget(@GetCurrentUserId() userId: string, @Param('id') id: string) {
		await this.searchService.forget(userId, id);
	}
}
