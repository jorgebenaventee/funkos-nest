import { Category } from '@/rest/category/entities/category.entity'
import { Funko } from '@/rest/funko/entities/funko.entity'
import { NotificationsGateway } from '@/rest/notifications/notifications.gateway'
import { NotificationsModule } from '@/rest/notifications/notifications.module'
import { StorageModule } from '@/rest/storage/storage.module'
import { StorageService } from '@/rest/storage/storage.service'
import { Role, User } from '@/rest/user/entities/user.entity'
import { UserModule } from '@/rest/user/user.module'
import { UserService } from '@/rest/user/user.service'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FunkoMapper } from './funko-mapper/funko-mapper'
import { FunkoController } from './funko.controller'
import { FunkoService } from './funko.service'

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([Funko, Category, User, Role]),
    NotificationsModule,
    StorageModule,
    UserModule,
  ],
  controllers: [FunkoController],
  providers: [
    FunkoService,
    FunkoMapper,
    NotificationsGateway,
    StorageService,
    UserService,
  ],
  exports: [TypeOrmModule],
})
export class FunkoModule {}
