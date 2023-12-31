import { Module } from '@nestjs/common'
import { CategoryService } from './category.service'
import { CategoryController } from './category.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Category } from '@/rest/category/entities/category.entity'
import { CategoryMapper } from './category-mapper/category-mapper'

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [CategoryService, CategoryMapper],
  controllers: [CategoryController],
})
export class CategoryModule {}
