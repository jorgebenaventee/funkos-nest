import { Category } from '@/rest/category/entities/category.entity'
import { NotificationsGateway } from '@/rest/notifications/notifications.gateway'
import { NotificationsModule } from '@/rest/notifications/notifications.module'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { FunkoService } from './funko.service'
import { FunkoController } from './funko.controller'
import { FunkoMapper } from './funko-mapper/funko-mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Funko } from '@/rest/funko/entities/funko.entity'

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([Funko, Category]),
    NotificationsModule,
  ],
  controllers: [FunkoController],
  providers: [FunkoService, FunkoMapper, NotificationsGateway],
})
export class FunkoModule {}
