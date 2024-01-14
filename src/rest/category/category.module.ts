import { Category } from '@/rest/category/entities/category.entity'
import { NotificationsGateway } from '@/rest/notifications/notifications.gateway'
import { NotificationsModule } from '@/rest/notifications/notifications.module'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoryMapper } from './category-mapper/category-mapper'
import { CategoryController } from './category.controller'
import { CategoryService } from './category.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    NotificationsModule,
    CacheModule.register(),
  ],
  providers: [CategoryService, CategoryMapper, NotificationsGateway],
  controllers: [CategoryController],
})
export class CategoryModule {}
