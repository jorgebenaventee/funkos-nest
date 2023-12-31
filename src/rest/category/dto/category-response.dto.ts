import { OmitType } from '@nestjs/mapped-types'
import { Category } from '@/rest/category/entities/category.entity'

export class CategoryResponseDto extends OmitType(Category, [
  'deletedAt',
] as const) {}
