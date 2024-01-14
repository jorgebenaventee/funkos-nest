import { Category } from '@/rest/category/entities/category.entity'
import { OmitType } from '@nestjs/mapped-types'

export class CategoryResponseDto extends OmitType(Category, [
  'deletedAt',
] as const) {}
