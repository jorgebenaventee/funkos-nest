import { NotificationsGateway } from '@/rest/notifications/notifications.gateway'
import { NotificationsModule } from '@/rest/notifications/notifications.module'
import { Module } from '@nestjs/common'
import { CategoryService } from './category.service'
import { CategoryController } from './category.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Category } from '@/rest/category/entities/category.entity'
import { CategoryMapper } from './category-mapper/category-mapper'

@Module({
  imports: [TypeOrmModule.forFeature([Category]), NotificationsModule],
  providers: [CategoryService, CategoryMapper, NotificationsGateway],
  controllers: [CategoryController],
})
export class CategoryModule {}
