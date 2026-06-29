import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import type { CreateCategoryData, UpdateCategoryData } from '@event-space/shared';
import { AccessTokenGuard } from '../auth/guards';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Get()
	@ApiOperation({ summary: 'Get all categories' })
	@ApiResponse({ status: 200, description: 'Returns array of categories' })
	findAll() {
		return this.categoryService.findAll();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get category by id' })
	@ApiResponse({ status: 200, description: 'Returns category' })
	findOne(@Param('id') id: string) {
		return this.categoryService.findOne(id);
	}

	@Post()
	@UseGuards(AccessTokenGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create a new category' })
	@ApiResponse({ status: 201, description: 'Category created successfully' })
	create(@Body() data: CreateCategoryData) {
		return this.categoryService.create(data);
	}

	@Put(':id')
	@UseGuards(AccessTokenGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update category' })
	@ApiResponse({ status: 200, description: 'Category updated successfully' })
	update(@Param('id') id: string, @Body() data: UpdateCategoryData) {
		return this.categoryService.update(id, data);
	}

	@Delete(':id')
	@UseGuards(AccessTokenGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete category' })
	@ApiResponse({ status: 200, description: 'Category deleted successfully' })
	delete(@Param('id') id: string) {
		return this.categoryService.delete(id);
	}
}
