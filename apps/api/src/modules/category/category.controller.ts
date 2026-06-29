import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import type { Locale, LocaleEnum } from '@event-space/shared';
// import { Locale } from '@prisma/client';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Get()
	@ApiOperation({ summary: 'Get categories with translations for requested language' })
	@ApiResponse({ status: 200, description: 'Returns array of categories' })
	findAll() {
		return this.categoryService.findAll();
	}
}
