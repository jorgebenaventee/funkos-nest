import { Injectable } from '@nestjs/common'
import type { CreateCategoryDto } from '@/rest/category/dto/create-category.dto'
import type { Category } from '@/rest/category/entities/category.entity'
import type { UpdateCategoryDto } from '@/rest/category/dto/update-category.dto'
import type { CategoryResponseDto } from '@/rest/category/dto/category-response.dto'

@Injectable()
export class CategoryMapper {
  fromCreateToEntity(
    createCategoryDto: CreateCategoryDto,
  ): Omit<Category, 'id' | 'deletedAt'> {
    return {
      name: createCategoryDto.name,
    }
  }

  fromEntityToResponseDto(category: Category): CategoryResponseDto {
    const { deletedAt, ...categoryResponseDto } = category
    return categoryResponseDto
  }

  fromUpdateToEntity(
    category: Category,
    updateCategoryDto: UpdateCategoryDto,
  ): Category {
    return {
      ...category,
      ...updateCategoryDto,
    }
  }
}
